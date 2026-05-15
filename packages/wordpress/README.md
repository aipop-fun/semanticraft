# SemantiCraft WordPress Plugin

AI-powered semantic analysis and structured data injection for WordPress content.

## Requirements

* WordPress 5.0+
* PHP 7.4+
* SemantiCraft API key

## Installation

1. Upload the `semanticraft` folder to `/wp-content/plugins/`
2. Activate through WordPress admin
3. Configure API key in Settings > SemantiCraft

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| API Key | SemantiCraft API credential | - |
| Auto-enable | Process content automatically | true |
| Content Selectors | CSS selectors for content areas | `.entry-content, .post-content, article` |

## Structure

```
semanticraft/
├── semanticraft.php          # Main plugin file
├── includes/
│   ├── class-parser.php     # Content parsing & JSON-LD generation
│   ├── class-frontend.php   # Frontend output & script injection
│   └── class-admin.php      # Admin settings page
├── assets/
│   ├── js/semanticraft.js   # Frontend JavaScript
│   └── css/semanticraft.css # Plugin styles
└── readme.txt               # WordPress readme
```

## Hooks

### Filters

* `semanticraft_process_content` - Process content before JSON-LD injection
* `semanticraft_json_ld_schema` - Modify generated JSON-LD schema

### Actions

* `semanticraft_before_injection` - Before JSON-LD injection
* `semanticraft_after_injection` - After JSON-LD injection

## License

GPL-2.0-or-later