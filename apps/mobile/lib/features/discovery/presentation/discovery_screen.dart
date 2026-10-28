import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../data/repositories.dart';
import '../../categories/data/category_model.dart';
import '../../business_details/data/business_model.dart';

final homeStateProvider = FutureProvider<HomeState>((ref) async {
  final businessRepo = ref.watch(businessRepositoryProvider);
  final categoryRepo = ref.watch(categoryRepositoryProvider);

  final results = await Future.wait([
    businessRepo.getBusinesses(limit: 10),
    categoryRepo.getRootCategories(),
  ]);

  return HomeState(
    businesses: results[0] as BusinessListResponse,
    categories: results[1] as List<Category>,
  );
});

class HomeState {
  final BusinessListResponse businesses;
  final List<Category> categories;

  HomeState({required this.businesses, required this.categories});
}

class DiscoveryScreen extends ConsumerWidget {
  const DiscoveryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeStateProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Findly'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => Navigator.pushNamed(context, '/search'),
          ),
        ],
      ),
      body: homeState.when(
        data: (data) => RefreshIndicator(
          onRefresh: () => ref.refresh(homeStateProvider.future),
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(AppConstants.defaultPadding),
                  child: GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/search'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.search, color: Colors.grey.shade600),
                          const SizedBox(width: 12),
                          Text(
                            'Search businesses, services...',
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              if (data.categories.isNotEmpty) ...[
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
                    child: Text('Categories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 100,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: data.categories.length,
                      itemBuilder: (context, index) {
                        final category = data.categories[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: CategoryChip(category: category),
                        );
                      },
                    ),
                  ),
                ),
              ],
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text('Nearby Businesses', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
              if (data.businesses.businesses.isEmpty)
                const SliverFillRemaining(
                  child: Center(
                    child: Text('No businesses found'),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final business = data.businesses.businesses[index];
                      return BusinessCard(business: business);
                    },
                    childCount: data.businesses.businesses.length,
                  ),
                ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class CategoryChip extends StatelessWidget {
  final Category category;

  const CategoryChip({super.key, required this.category});

  IconData _getIconForCategory(String? icon) {
    switch (icon) {
      case 'restaurant':
        return Icons.restaurant;
      case 'shopping_bag':
        return Icons.shopping_bag;
      case 'local_hospital':
        return Icons.local_hospital;
      case 'school':
        return Icons.school;
      case 'directions_car':
        return Icons.directions_car;
      case 'computer':
        return Icons.computer;
      case 'account_balance':
        return Icons.account_balance;
      case 'content_cut':
        return Icons.content_cut;
      case 'home':
        return Icons.home;
      case 'sports_bar':
        return Icons.sports_bar;
      case 'work':
        return Icons.work;
      case 'construction':
        return Icons.construction;
      default:
        return Icons.category;
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Navigator.pushNamed(context, '/category/${category.id}'),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 80,
        padding: const EdgeInsets.all(8),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _getIconForCategory(category.icon),
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              category.name,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}

class BusinessCard extends StatelessWidget {
  final Business business;

  const BusinessCard({super.key, required this.business});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, '/business/${business.id}'),
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.business, color: Colors.grey.shade400),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      business.name,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (business.address != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        business.address!,
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    if (business.description != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        business.description!,
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
