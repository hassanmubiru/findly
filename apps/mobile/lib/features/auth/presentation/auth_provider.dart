import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import '../../core/constants/app_constants.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final authStateProvider = StateNotifierProvider<AuthStateNotifier, AuthState>((ref) {
  return AuthStateNotifier(ref.watch(apiClientProvider));
});

class AuthState {
  final bool isAuthenticated;
  final String? userId;
  final String? userName;
  final String? userEmail;
  final String? token;
  final bool isLoading;

  const AuthState({
    this.isAuthenticated = false,
    this.userId,
    this.userName,
    this.userEmail,
    this.token,
    this.isLoading = false,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? userId,
    String? userName,
    String? userEmail,
    String? token,
    bool? isLoading,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userEmail: userEmail ?? this.userEmail,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthStateNotifier extends StateNotifier<AuthState> {
  final ApiClient _client;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthStateNotifier(this._client) : super(const AuthState()) {
    _loadStoredAuth();
  }

  Future<void> _loadStoredAuth() async {
    final token = await _storage.read(key: StorageKeys.authToken);
    final userId = await _storage.read(key: StorageKeys.userId);
    final userEmail = await _storage.read(key: StorageKeys.userEmail);
    final userName = await _storage.read(key: StorageKeys.userName);

    if (token != null && userId != null) {
      _client.setAuthToken(token);
      state = AuthState(
        isAuthenticated: true,
        token: token,
        userId: userId,
        userEmail: userEmail,
        userName: userName,
      );
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _client.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final authData = response.data as Map<String, dynamic>;
      final user = authData['user'] as Map<String, dynamic>;
      final token = authData['token'] as String;

      _client.setAuthToken(token);
      await _storage.write(key: StorageKeys.authToken, value: token);
      await _storage.write(key: StorageKeys.userId, value: user['id'] as String);
      await _storage.write(key: StorageKeys.userEmail, value: user['email'] as String);
      await _storage.write(key: StorageKeys.userName, value: user['name'] as String);

      state = AuthState(
        isAuthenticated: true,
        token: token,
        userId: user['id'] as String,
        userEmail: user['email'] as String,
        userName: user['name'] as String,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> register(String email, String password, String name) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _client.post('/auth/register', data: {
        'email': email,
        'password': password,
        'name': name,
      });
      final authData = response.data as Map<String, dynamic>;
      final user = authData['user'] as Map<String, dynamic>;
      final token = authData['token'] as String;

      _client.setAuthToken(token);
      await _storage.write(key: StorageKeys.authToken, value: token);
      await _storage.write(key: StorageKeys.userId, value: user['id'] as String);
      await _storage.write(key: StorageKeys.userEmail, value: user['email'] as String);
      await _storage.write(key: StorageKeys.userName, value: user['name'] as String);

      state = AuthState(
        isAuthenticated: true,
        token: token,
        userId: user['id'] as String,
        userEmail: user['email'] as String,
        userName: user['name'] as String,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  Future<void> logout() async {
    _client.clearAuthToken();
    await _storage.delete(key: StorageKeys.authToken);
    await _storage.delete(key: StorageKeys.userId);
    await _storage.delete(key: StorageKeys.userEmail);
    await _storage.delete(key: StorageKeys.userName);
    state = const AuthState();
  }
}
