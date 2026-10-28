import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import '../business_details/data/business_model.dart';
import '../categories/data/category_model.dart';

final businessRepositoryProvider = Provider<BusinessRepository>((ref) {
  return BusinessRepository(ref.watch(apiClientProvider));
});

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepository(ref.watch(apiClientProvider));
});

class BusinessRepository {
  final ApiClient _client;

  BusinessRepository(this._client);

  Future<BusinessListResponse> getBusinesses({int limit = 20, int offset = 0}) async {
    final response = await _client.get('/businesses', queryParameters: {
      'limit': limit,
      'offset': offset,
    });
    return BusinessListResponse.fromJson(response.data);
  }

  Future<Business> getBusinessById(String id) async {
    final response = await _client.get('/businesses/$id');
    final data = response.data as Map<String, dynamic>;
    return Business.fromJson(data['business']);
  }

  Future<List<Business>> getBusinessesByNeighborhood(String neighborhoodId, {int limit = 20, int offset = 0}) async {
    final response = await _client.get('/businesses/neighborhood/$neighborhoodId', queryParameters: {
      'limit': limit,
      'offset': offset,
    });
    final data = response.data as Map<String, dynamic>;
    return (data['businesses'] as List).map((b) => Business.fromJson(b)).toList();
  }

  Future<List<Business>> getBusinessesByCategory(String categoryId, {int limit = 20, int offset = 0}) async {
    final response = await _client.get('/businesses/category/$categoryId', queryParameters: {
      'limit': limit,
      'offset': offset,
    });
    final data = response.data as Map<String, dynamic>;
    return (data['businesses'] as List).map((b) => Business.fromJson(b)).toList();
  }
}

class CategoryRepository {
  final ApiClient _client;

  CategoryRepository(this._client);

  Future<List<Category>> getCategories() async {
    final response = await _client.get('/categories');
    final data = response.data as Map<String, dynamic>;
    return (data['categories'] as List).map((c) => Category.fromJson(c)).toList();
  }

  Future<List<Category>> getRootCategories() async {
    final response = await _client.get('/categories/root');
    final data = response.data as Map<String, dynamic>;
    return (data['categories'] as List).map((c) => Category.fromJson(c)).toList();
  }

  Future<Category> getCategoryById(String id) async {
    final response = await _client.get('/categories/$id');
    final data = response.data as Map<String, dynamic>;
    return Category.fromJson(data['category']);
  }

  Future<List<Category>> getCategoryChildren(String parentId) async {
    final response = await _client.get('/categories/$parentId/children');
    final data = response.data as Map<String, dynamic>;
    return (data['categories'] as List).map((c) => Category.fromJson(c)).toList();
  }
}
