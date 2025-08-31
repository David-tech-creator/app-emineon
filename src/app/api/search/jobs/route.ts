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
      'employmentType',
      'experienceLevel',
      'department',
      'remote',
      'urgent',
      'featured',
      'company',
      'location'
    ];

    filterParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        filters[param] = value;
      }
    });

    // Handle array filters (skills, benefits, etc.)
    const skills = searchParams.get('skills');
    if (skills) {
      filters.skills = skills.split(',');
    }

    console.log('🔍 Searching jobs with query:', query, 'filters:', filters);

    const result = await AlgoliaService.searchJobs(query, filters, {
      page,
      limit,
      attributesToHighlight: ['title', 'company', 'location', 'description', 'skills'],
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
    console.error('❌ Error searching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search jobs',
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

    console.log('🔍 Advanced job search:', { query, filters, facets, page, limit });

    const searchOptions: any = {
      page,
      limit,
      attributesToHighlight: ['title', 'company', 'location', 'description', 'requirements', 'skills'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      facets: facets.length > 0 ? facets : ['status', 'employmentType', 'experienceLevel', 'department', 'skills', 'remote'],
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

    const result = await AlgoliaService.searchJobs(query, filters, searchOptions);

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
    console.error('❌ Error in advanced job search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
