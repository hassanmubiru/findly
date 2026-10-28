class AppConstants {
  static const String appName = 'Findly';
  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:3000/api/v1');

  static const int searchDebounceMs = 300;
  static const int pageSize = 20;

  static const double defaultPadding = 16.0;
  static const double cardRadius = 12.0;
  static const double iconSize = 24.0;
}

class StorageKeys {
  static const String authToken = 'auth_token';
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';
  static const String userName = 'user_name';
}
