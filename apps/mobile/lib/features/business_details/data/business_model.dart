class Business {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? phone;
  final String? email;
  final String? website;
  final String status;
  final String verificationStatus;
  final String? cityId;
  final String? neighborhoodId;
  final String? ownerId;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<String> categories;
  final List<String> services;

  Business({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.address,
    this.latitude,
    this.longitude,
    this.phone,
    this.email,
    this.website,
    this.status = 'draft',
    this.verificationStatus = 'unverified',
    this.cityId,
    this.neighborhoodId,
    this.ownerId,
    this.createdAt,
    this.updatedAt,
    this.categories = const [],
    this.services = const [],
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      website: json['website'] as String?,
      status: json['status'] as String? ?? 'draft',
      verificationStatus: json['verification_status'] as String? ?? 'unverified',
      cityId: json['city_id'] as String?,
      neighborhoodId: json['neighborhood_id'] as String?,
      ownerId: json['owner_id'] as String?,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'] as String) : null,
      updatedAt: json['updated_at'] != null ? DateTime.tryParse(json['updated_at'] as String) : null,
      categories: (json['categories'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      services: (json['services'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    'description': description,
    'address': address,
    'latitude': latitude,
    'longitude': longitude,
    'phone': phone,
    'email': email,
    'website': website,
    'status': status,
    'verification_status': verificationStatus,
    'city_id': cityId,
    'neighborhood_id': neighborhoodId,
    'owner_id': ownerId,
    'created_at': createdAt?.toIso8601String(),
    'updated_at': updatedAt?.toIso8601String(),
    'categories': categories,
    'services': services,
  };
}

class BusinessListResponse {
  final List<Business> businesses;
  final int total;
  final int limit;
  final int offset;

  BusinessListResponse({
    required this.businesses,
    required this.total,
    required this.limit,
    required this.offset,
  });

  factory BusinessListResponse.fromJson(Map<String, dynamic> json) {
    return BusinessListResponse(
      businesses: (json['businesses'] as List<dynamic>)
          .map((b) => Business.fromJson(b as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int? ?? 0,
      limit: json['limit'] as int? ?? 20,
      offset: json['offset'] as int? ?? 0,
    );
  }
}
