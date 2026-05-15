<?php
/**
 * Plugin Name: SemantiCraft
 * Plugin URI: https://semanticraft.dev
 * Description: AI-powered semantic analysis and structured data injection for WordPress content
 * Version: 1.0.0
 * Author: SemantiCraft Team
 * Author URI: https://semanticraft.dev
 * License: GPL v2 or later
 * Text Domain: semanticraft
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SEMANTICRAFT_VERSION', '1.0.0');
define('SEMANTICRAFT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SEMANTICRAFT_PLUGIN_URL', plugin_dir_url(__FILE__));

class SemantiCraft
{
    private $parser;
    private $frontend;
    private $admin;
    private $options;

    public function __construct()
    {
        $this->options = get_option('semanticraft_settings', [
            'apiKey' => '',
            'autoEnable' => true,
            'contentSelectors' => '.entry-content, .post-content, article'
        ]);

        $this->load_dependencies();
        $this->init_components();
        $this->setup_hooks();
    }

    private function load_dependencies()
    {
        require_once SEMANTICRAFT_PLUGIN_DIR . 'includes/class-parser.php';
        require_once SEMANTICRAFT_PLUGIN_DIR . 'includes/class-frontend.php';
        require_once SEMANTICRAFT_PLUGIN_DIR . 'includes/class-admin.php';
    }

    private function init_components()
    {
        $this->parser = new SemantiCraft_Parser($this->options);
        $this->frontend = new SemantiCraft_Frontend($this->parser, $this->options);
        $this->admin = new SemantiCraft_Admin($this->parser, $this->options);
    }

    private function setup_hooks()
    {
        add_action('init', [$this, 'load_textdomain']);
        add_action('wp_footer', [$this->frontend, 'inject_embed_script']);
        add_filter('the_content', [$this->parser, 'process_content']);
        add_action('admin_menu', [$this->admin, 'add_admin_menu']);
        add_action('admin_init', [$this->admin, 'register_settings']);
    }

    public function load_textdomain()
    {
        load_plugin_textdomain(
            'semanticraft',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }

    public static function activate()
    {
        $default_options = [
            'apiKey' => '',
            'autoEnable' => true,
            'contentSelectors' => '.entry-content, .post-content, article'
        ];

        if (!get_option('semanticraft_settings')) {
            add_option('semanticraft_settings', $default_options);
        }

        flush_rewrite_rules();
    }

    public static function deactivate()
    {
        flush_rewrite_rules();
    }

    public function get_options()
    {
        return $this->options;
    }
}

register_activation_hook(__FILE__, ['SemantiCraft', 'activate']);
register_deactivation_hook(__FILE__, ['SemantiCraft', 'deactivate']);

new SemantiCraft();