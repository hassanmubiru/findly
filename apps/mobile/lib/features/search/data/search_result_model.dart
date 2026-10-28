class SearchBusiness {
  final String id;
  final String name;
  final String? description;
  final String slug;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? phone;
  final String? website;
  final String? cityId;
  final String? neighborhoodId;
  final List<String> categoryIds;
  final List<String> categoryNames;
  final List<String> serviceNames;

  SearchBusiness({
    required this.id,
    required this.name,
    this.description,
    required this.slug,
    this.address,
    this.latitude,
    this.longitude,
    this.phone,
    this.website,
    this.cityId,
    this.neighborhoodId,
    this.categoryIds = const [],
    this.categoryNames = const [],
    this.serviceNames = const [],
  });

  factory SearchBusiness.fromJson(Map<String, dynamic> json) {
    return SearchBusiness(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      slug: json['slug'] as String,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      phone: json['phone'] as String?,
      website: json['website'] as String?,
      cityId: json['city_id'] as String?,
      neighborhoodId: json['neighborhood_id'] as String?,
      categoryIds: (json['category_ids'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      categoryNames: (json['category_names'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      serviceNames: (json['service_names'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
    );
  }
}

class SearchFacets {
  final List<FacetCount> categoryNames;
  final List<FacetCount> neighborhoodNames;

  SearchFacets({this.categoryNames = const [], this.neighborhoodNames = const []});

  factory SearchFacets.fromJson(Map<String, dynamic> json) {
    return SearchFacets(
      categoryNames: (json['category_names'] as List<dynamic>?)
          ?.map((e) => FacetCount.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      neighborhoodNames: (json['neighborhood_names'] as List<dynamic>?)
          ?.map((e) => FacetCount.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }
}

class FacetCount {
  final String value;
  final int count;

  FacetCount({required this.value, required this.count});

  factory FacetCount.fromJson(Map<String, dynamic> json) {
    return FacetCount(
      value: json['value'] as String,
      count: json['count'] as int,
    );
  }
}

class SearchResult {
  final List<SearchBusiness> businesses;
  final int total;
  final int page;
  final SearchFacets? facets;
  final String query;

  SearchResult({
    required this.businesses,
    required this.total,
    required this.page,
    this.facets,
    required this.query,
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      businesses: (json['businesses'] as List<dynamic>)
          .map((b) => SearchBusiness.fromJson(b as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      facets: json['facets'] != null ? SearchFacets.fromJson(json['facets'] as Map<String, dynamic>) : null,
      query: json['query'] as String? ?? '',
    );
  }
}

class SearchSuggestion {
  final String name;
  final String slug;

  SearchSuggestion({required this.name, required this.slug});

  factory SearchSuggestion.fromJson(Map<String, dynamic> json) {
    return SearchSuggestion(
      name: json['name'] as String,
      slug: json['slug'] as String,
    );
  }
}
