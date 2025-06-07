'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreHorizontal,
  FileText,
  Calendar,
  User,
  Building2,
  Share2,
  Settings
} from 'lucide-react';
import { CreateCompetenceFileModal } from '@/components/competence-files/CreateCompetenceFileModal';
import { CreateTemplateModal } from '@/components/competence-files/CreateTemplateModal';

// Mock data for competence files
const mockCompetenceFiles = [
  {
    id: '1',
    candidateName: 'Sarah Johnson',
    candidateTitle: 'Senior Frontend Engineer',
    template: 'UBS Tech Template',
    client: 'UBS Investment Bank',
    job: 'Senior React Developer',
    status: 'Generated',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    version: 1,
    downloadCount: 3,
    isAnonymized: false
  },
  {
    id: '2',
    candidateName: 'David Chen',
    candidateTitle: 'Backend Engineer',
    template: 'Credit Suisse Template',
    client: 'Credit Suisse',
    job: 'Python Developer',
    status: 'Draft',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15',
    version: 2,
    downloadCount: 0,
    isAnonymized: true
  },
  {
    id: '3',
    candidateName: 'Mike Rodriguez',
    candidateTitle: 'Senior Engineer',
    template: 'Standard CV Template',
    client: 'Zurich Insurance',
    job: 'Java Developer',
    status: 'Generated',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13',
    version: 1,
    downloadCount: 7,
    isAnonymized: false
  }
];

const statusColors = {
  'Generated': 'bg-green-100 text-green-800',
  'Draft': 'bg-yellow-100 text-yellow-800',
  'Archived': 'bg-gray-100 text-gray-800'
};

export default function CompetenceFilesPage() {
  const [activeTab, setActiveTab] = useState('files');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [competenceFiles, setCompetenceFiles] = useState(mockCompetenceFiles);
  const [templates, setTemplates] = useState<any[]>([]);

  const filteredFiles = competenceFiles.filter(file => {
    const matchesSearch = file.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.job.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || file.status.toLowerCase() === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateFile = (fileData: any) => {
    const newFile = {
      id: Date.now().toString(),
      ...fileData,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      version: 1,
      downloadCount: 0
    };
    setCompetenceFiles([newFile, ...competenceFiles]);
  };

  const handleCreateTemplate = (templateData: any) => {
    const newTemplate = {
      id: Date.now().toString(),
      ...templateData
    };
    setTemplates([newTemplate, ...templates]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Competence Files</h1>
            <p className="text-gray-600 mt-1">
              Create and manage polished, client-facing candidate profiles
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setIsCreateTemplateModalOpen(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Competence File
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('files')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'files'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Competence Files ({competenceFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates ({templates.length})
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{competenceFiles.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Generated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {competenceFiles.filter(f => f.status === 'Generated').length}
                  </p>
                </div>
                <Download className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {competenceFiles.filter(f => f.status === 'Draft').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {competenceFiles.reduce((sum, f) => sum + f.downloadCount, 0)}
                  </p>
                </div>
                <Share2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={activeTab === 'files' ? "Search candidates, clients, jobs..." : "Search templates..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {activeTab === 'files' && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="generated">Generated</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'files' ? (
          <div className="space-y-4">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No competence files found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first competence file to get started'
                  }
                </p>
                {!searchQuery && selectedFilter === 'all' && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Competence File
                  </Button>
                )}
              </div>
            ) : (
              filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">{file.candidateName}</h3>
                            <Badge className={statusColors[file.status as keyof typeof statusColors]}>
                              {file.status}
                            </Badge>
                            {file.isAnonymized && (
                              <Badge variant="outline" className="text-xs">
                                Anonymized
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{file.candidateTitle}</p>
                          
                          <div className="flex items-center space-x-6 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Building2 className="h-3 w-3" />
                              <span>{file.client}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{file.job}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created {file.createdAt}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download className="h-3 w-3" />
                              <span>{file.downloadCount} downloads</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          /* Templates List */
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-4">
                  Create your first template to standardize competence file generation
                </p>
                <Button onClick={() => setIsCreateTemplateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            ) : (
              templates.filter(template => 
                template.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <Badge className="bg-green-100 text-green-800">
                              {template.status}
                            </Badge>
                            {template.isClientSpecific && (
                              <Badge variant="outline" className="text-xs">
                                Client-specific
                              </Badge>
                            )}
                          </div>
                          
                          {template.description && (
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-6 mt-2 text-xs text-gray-500">
                            {template.client && (
                              <div className="flex items-center space-x-1">
                                <Building2 className="h-3 w-3" />
                                <span>{template.client}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>{template.sections?.length || 0} sections</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Modals */}
      <CreateCompetenceFileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateFile}
      />
      
      <CreateTemplateModal
        isOpen={isCreateTemplateModalOpen}
        onClose={() => setIsCreateTemplateModalOpen(false)}
        onSuccess={handleCreateTemplate}
      />
    </Layout>
  );
} 