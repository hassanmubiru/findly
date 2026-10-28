import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import '../auth/data/user_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(apiClientProvider));
});

class AuthRepository {
  final ApiClient _client;

  AuthRepository(this._client);

  Future<AuthResponse> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final response = await _client.post('/auth/register', data: {
      'email': email,
      'password': password,
      'name': name,
    });
    return AuthResponse.fromJson(response.data);
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return AuthResponse.fromJson(response.data);
  }

  Future<User> getCurrentUser() async {
    final response = await _client.get('/auth/me');
    final data = response.data as Map<String, dynamic>;
    return User.fromJson(data['user']);
  }
}
