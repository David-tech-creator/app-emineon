'use client';

import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Building2, Users, MapPin, Phone, Mail, Plus } from 'lucide-react';

export default function ClientsPage() {
  const dummyClients = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      industry: 'Technology',
      location: 'San Francisco, CA',
      employees: '500-1000',
      contact: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      activeJobs: 5,
      totalHires: 23,
    },
    {
      id: '2', 
      name: 'InnovateLabs',
      industry: 'Software Development',
      location: 'Austin, TX',
      employees: '100-500',
      contact: 'mike.chen@innovatelabs.io',
      phone: '+1 (555) 987-6543',
      activeJobs: 3,
      totalHires: 12,
    },
    {
      id: '3',
      name: 'Digital Dynamics',
      industry: 'Digital Marketing',
      location: 'New York, NY',
      employees: '50-100',
      contact: 'alex.rodriguez@digitaldynamics.com',
      phone: '+1 (555) 456-7890',
      activeJobs: 2,
      totalHires: 8,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Clients</h1>
            <p className="text-secondary-600 mt-1">
              Manage your client relationships and partnerships
            </p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyClients.map((client) => (
            <Card key={client.id} variant="elevated" className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 text-lg">
                        {client.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {client.industry}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-secondary-500 mr-2" />
                    <span className="text-secondary-700">{client.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-secondary-500 mr-2" />
                    <span className="text-secondary-700">{client.employees} employees</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-secondary-500 mr-2" />
                    <span className="text-secondary-700 truncate">{client.contact}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-secondary-500 mr-2" />
                    <span className="text-secondary-700">{client.phone}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-secondary-200">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-primary-900">{client.activeJobs}</p>
                      <p className="text-xs text-secondary-600">Active Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-success-600">{client.totalHires}</p>
                      <p className="text-xs text-secondary-600">Total Hires</p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <div className="flex space-x-2 w-full">
                  <button className="flex-1 btn-secondary text-sm">
                    View Details
                  </button>
                  <button className="flex-1 btn-primary text-sm">
                    Post Job
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State Card for Demo */}
        <Card className="text-center py-12 border-dashed border-2 border-secondary-300">
          <CardContent>
            <Building2 className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Add More Clients
            </h3>
            <p className="text-secondary-600 mb-6">
              Expand your network by adding more client companies to work with.
            </p>
            <button className="btn-primary inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add New Client</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 