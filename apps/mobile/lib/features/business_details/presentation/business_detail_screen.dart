import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_constants.dart';
import '../../discovery/data/repositories.dart';
import '../../business_details/data/business_model.dart';

final businessDetailProvider = FutureProvider.autoDispose.family<Business, String>((ref, id) async {
  final repo = ref.watch(businessRepositoryProvider);
  return repo.getBusinessById(id);
});

class BusinessDetailScreen extends ConsumerWidget {
  final String businessId;

  const BusinessDetailScreen({super.key, required this.businessId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final businessAsync = ref.watch(businessDetailProvider(businessId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
        ],
      ),
      body: businessAsync.when(
        data: (business) => SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 200,
                width: double.infinity,
                color: Colors.grey.shade200,
                child: Icon(Icons.business, size: 80, color: Colors.grey.shade400),
              ),
              Padding(
                padding: const EdgeInsets.all(AppConstants.defaultPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      business.name,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    if (business.description != null)
                      Text(
                        business.description!,
                        style: TextStyle(color: Colors.grey.shade700, height: 1.5),
                      ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 16),
                    if (business.address != null) ...[
                      _DetailRow(
                        icon: Icons.location_on,
                        label: 'Address',
                        value: business.address!,
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (business.phone != null) ...[
                      _DetailRow(
                        icon: Icons.phone,
                        label: 'Phone',
                        value: business.phone!,
                        onTap: () => _launchPhone(business.phone!),
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (business.email != null) ...[
                      _DetailRow(
                        icon: Icons.email,
                        label: 'Email',
                        value: business.email!,
                        onTap: () => _launchEmail(business.email!),
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (business.website != null) ...[
                      _DetailRow(
                        icon: Icons.language,
                        label: 'Website',
                        value: business.website!,
                        onTap: () => _launchUrl(business.website!),
                      ),
                      const SizedBox(height: 12),
                    ],
                    if (business.categories.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('Categories', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: business.categories
                            .map((c) => Chip(label: Text(c)))
                            .toList(),
                      ),
                    ],
                    if (business.services.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('Services', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: business.services
                            .map((s) => Chip(label: Text(s)))
                            .toList(),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error loading business: $e'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(businessDetailProvider(businessId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _launchPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _launchEmail(String email) async {
    final uri = Uri.parse('mailto:$email');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onTap;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: Theme.of(context).primaryColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                Text(value, style: const TextStyle(fontSize: 15)),
              ],
            ),
          ),
          if (onTap != null) const Icon(Icons.chevron_right, color: Colors.grey),
        ],
      ),
    );
  }
}
