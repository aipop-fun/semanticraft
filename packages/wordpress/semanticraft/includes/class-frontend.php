<?php

if (!defined('ABSPATH')) {
    exit;
}

class SemantiCraft_Frontend
{
    private $parser;
    private $options;

    public function __construct($parser, $options)
    {
        $this->parser = $parser;
        $this->options = $options;
    }

    public function inject_embed_script()
    {
        if (!is_single() && !is_page()) {
            return;
        }

        if (!$this->parser->is_api_configured()) {
            return;
        }

        $embed_url = 'https://embed.semanticraft.dev/v1.js';
        $api_key = esc_attr($this->options['apiKey']);
        $selectors = esc_attr($this->options['contentSelectors']);

        printf(
            '<script src="%s" data-api-key="%s" data-selectors="%s" defer></script>',
            esc_url($embed_url),
            $api_key,
            $selectors
        );
    }

    public function enqueue_assets()
    {
        wp_enqueue_style(
            'semanticraft-frontend',
            SEMANTICRAFT_PLUGIN_URL . 'assets/css/semanticraft.css',
            [],
            SEMANTICRAFT_VERSION
        );

        wp_enqueue_script(
            'semanticraft-frontend',
            SEMANTICRAFT_PLUGIN_URL . 'assets/js/semanticraft.js',
            ['jquery'],
            SEMANTICRAFT_VERSION,
            true
        );

        wp_localize_script('semanticraft-frontend', 'semanticraftData', [
            'apiKey' => $this->options['apiKey'],
            'selectors' => $this->options['contentSelectors'],
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('semanticraft_nonce')
        ]);
    }
}