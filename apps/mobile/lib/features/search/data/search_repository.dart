import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import '../search/data/search_result_model.dart';

final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  return SearchRepository(ref.watch(apiClientProvider));
});

class SearchRepository {
  final ApiClient _client;

  SearchRepository(this._client);

  Future<SearchResult> search({
    String? query,
    String? categoryId,
    String? neighborhoodId,
    String? cityId,
    int page = 1,
    int perPage = 20,
    String? sortBy,
  }) async {
    final queryParams = <String, dynamic>{
      if (query != null && query.isNotEmpty) 'q': query,
      if (categoryId != null) 'category_id': categoryId,
      if (neighborhoodId != null) 'neighborhood_id': neighborhoodId,
      if (cityId != null) 'city_id': cityId,
      'page': page,
      'per_page': perPage,
      if (sortBy != null) 'sort_by': sortBy,
    };

    final response = await _client.get('/search', queryParameters: queryParams);
    return SearchResult.fromJson(response.data);
  }

  Future<List<SearchSuggestion>> getSuggestions(String query, {int limit = 5}) async {
    final response = await _client.get('/search/suggestions', queryParameters: {
      'q': query,
      'limit': limit,
    });
    final data = response.data as Map<String, dynamic>;
    return (data['suggestions'] as List)
        .map((s) => SearchSuggestion.fromJson(s))
        .toList();
  }
}
