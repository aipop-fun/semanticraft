<?php

if (!defined('ABSPATH')) {
    exit;
}

class SemantiCraft_Admin
{
    private $parser;
    private $options;

    public function __construct($parser, $options)
    {
        $this->parser = $parser;
        $this->options = $options;
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    public function add_admin_menu()
    {
        add_options_page(
            'SemantiCraft Settings',
            'SemantiCraft',
            'manage_options',
            'semanticraft',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings()
    {
        register_setting('semanticraft_settings_group', 'semanticraft_settings', [
            'sanitize_callback' => [$this, 'sanitize_settings']
        ]);

        add_settings_section(
            'semanticraft_main_section',
            'API Configuration',
            null,
            'semanticraft'
        );

        add_settings_field('semanticraft_api_key', 'API Key', [$this, 'render_api_key_field'], 'semanticraft', 'semanticraft_main_section');

        add_settings_section('semanticraft_options_section', 'Processing Options', null, 'semanticraft');

        add_settings_field('semanticraft_auto_enable', 'Auto-enable Processing', [$this, 'render_auto_enable_field'], 'semanticraft', 'semanticraft_options_section');

        add_settings_field('semanticraft_content_selectors', 'Content Selectors', [$this, 'render_selectors_field'], 'semanticraft', 'semanticraft_options_section');
    }

    public function sanitize_settings($input)
    {
        $sanitized = [];

        $sanitized['apiKey'] = sanitize_text_field($input['apiKey'] ?? '');
        $sanitized['autoEnable'] = !empty($input['autoEnable']);
        $sanitized['contentSelectors'] = sanitize_text_field($input['contentSelectors'] ?? '.entry-content, .post-content, article');

        return $sanitized;
    }

    public function render_settings_page()
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1>SemantiCraft Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('semanticraft_settings_group');
                do_settings_sections('semanticraft');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function render_api_key_field()
    {
        $value = $this->options['apiKey'] ?? '';
        printf(
            '<input type="text" id="semanticraft_api_key" name="semanticraft_settings[apiKey]" value="%s" class="regular-text" placeholder="sk_semanticraft_..." />',
            esc_attr($value)
        );
        echo '<p class="description">Obtain your API key from the SemantiCraft dashboard.</p>';
    }

    public function render_auto_enable_field()
    {
        $checked = !empty($this->options['autoEnable']) ? 'checked' : '';
        printf(
            '<input type="checkbox" id="semanticraft_auto_enable" name="semanticraft_settings[autoEnable]" value="1" %s />',
            $checked
        );
        echo '<label for="semanticraft_auto_enable">Enable automatic content processing</label>';
    }

    public function render_selectors_field()
    {
        $value = $this->options['contentSelectors'] ?? '.entry-content, .post-content, article';
        printf(
            '<input type="text" id="semanticraft_content_selectors" name="semanticraft_settings[contentSelectors]" value="%s" class="regular-text" />',
            esc_attr($value)
        );
        echo '<p class="description">CSS selectors for content areas. Separate multiple selectors with commas.</p>';
    }

    public function enqueue_admin_assets($hook)
    {
        if (strpos($hook, 'semanticraft') === false) {
            return;
        }

        wp_enqueue_style(
            'semanticraft-admin',
            SEMANTICRAFT_PLUGIN_URL . 'assets/css/semanticraft.css',
            [],
            SEMANTICRAFT_VERSION
        );
    }
}