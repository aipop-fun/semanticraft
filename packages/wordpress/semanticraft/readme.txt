=== SemantiCraft ===
Contributors: semanticraft
Tags: seo, structured data, json-ld, markdown, semantic
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered semantic analysis and structured data injection for WordPress content.

== Description ==

SemantiCraft automatically analyzes your WordPress content and injects JSON-LD structured data for improved SEO and search engine visibility.

= Features =

* Automatic markdown content detection
* JSON-LD structured data injection
* Works with Classic Editor and Block Editor
* Customizable content selectors
* Admin settings page for API configuration

== Installation ==

1. Upload the `semanticraft` folder to `/wp-content/plugins/`
2. Activate the plugin through the WordPress admin interface
3. Navigate to Settings > SemantiCraft to configure your API key
4. Enable auto-processing or use the_content filter manually

== Frequently Asked Questions ==

= Do I need an API key? =

Yes, obtain your API key from the SemantiCraft dashboard at https://semanticraft.dev

= Which content selectors should I use? =

Default selectors work for most themes: `.entry-content, .post-content, article`
Customize in Settings > SemantiCraft for theme-specific selectors.

= Does it work with page builders? =

Yes, configure the content selectors in settings to target your page builder content areas.

== Changelog ==

= 1.0.0 =
* Initial release
* Markdown auto-detection
* JSON-LD injection
* Admin settings page
* Classic and Block Editor support