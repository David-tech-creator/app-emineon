import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { AlgoliaService } from '@/lib/services/algolia-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Extract filters from search params
    const filters: any = {};
    const filterParams = [
      'status',
      'seniorityLevel', 
      'primaryIndustry',
      'remotePreference',
      'educationLevel',
      'functionalDomain',
      'preferredContractType',
      'nationality',
      'workPermitType',
      'source'
    ];

    filterParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        filters[param] = value;
      }
    });

    // Handle array filters (skills, languages, etc.)
    const technicalSkills = searchParams.get('technicalSkills');
    if (technicalSkills) {
      filters.technicalSkills = technicalSkills.split(',');
    }

    const programmingLanguages = searchParams.get('programmingLanguages');
    if (programmingLanguages) {
      filters.programmingLanguages = programmingLanguages.split(',');
    }

    const frameworks = searchParams.get('frameworks');
    if (frameworks) {
      filters.frameworks = frameworks.split(',');
    }

    console.log('🔍 Searching candidates with query:', query, 'filters:', filters);

    const result = await AlgoliaService.searchCandidates(query, filters, {
      page,
      limit,
      attributesToHighlight: ['fullName', 'currentTitle', 'currentLocation', 'technicalSkills'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return NextResponse.json({
      success: true,
      data: result.hits,
      meta: {
        total: result.nbHits,
        page: result.page,
        pages: result.nbPages,
        limit: result.hitsPerPage,
        processingTime: result.processingTimeMS,
      }
    });

  } catch (error) {
    console.error('❌ Error searching candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search candidates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      query = '', 
      filters = {}, 
      facets = [], 
      page = 0, 
      limit = 20,
      sortBy = '',
      aroundLatLng = null,
      aroundRadius = null 
    } = body;

    console.log('🔍 Advanced candidate search:', { query, filters, facets, page, limit });

    const searchOptions: any = {
      page,
      limit,
      attributesToHighlight: ['fullName', 'currentTitle', 'currentLocation', 'technicalSkills', 'summary'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      facets: facets.length > 0 ? facets : ['status', 'seniorityLevel', 'primaryIndustry', 'technicalSkills'],
      maxValuesPerFacet: 100,
    };

    // Add geographical search if provided
    if (aroundLatLng) {
      searchOptions.aroundLatLng = aroundLatLng;
      if (aroundRadius) {
        searchOptions.aroundRadius = aroundRadius;
      }
    }

    // Add sorting if provided
    if (sortBy) {
      searchOptions.sortBy = sortBy;
    }

    const result = await AlgoliaService.searchCandidates(query, filters, searchOptions);

    return NextResponse.json({
      success: true,
      data: result.hits,
      facets: result.facets,
      meta: {
        total: result.nbHits,
        page: result.page,
        pages: result.nbPages,
        limit: result.hitsPerPage,
        processingTime: result.processingTimeMS,
      }
    });

  } catch (error) {
    console.error('❌ Error in advanced candidate search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search candidates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
