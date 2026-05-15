<?php

if (!defined('ABSPATH')) {
    exit;
}

class SemantiCraft_Parser
{
    private $options;
    private $markdown_patterns = [
        '/```[\s\S]*?```/',
        '/`[^`]+`/',
        '/\[([^\]]+)\]\([^\)]+\)/',
        '/[*_]{1,2}([^*_]+)[*_]{1,2}/',
        '/^#{1,6}\s+(.+)$/m',
        '/^\s*[-*+]\s+/m',
        '/^\s*\d+\.\s+/m'
    ];

    public function __construct($options)
    {
        $this->options = $options;
    }

    public function process_content($content)
    {
        if (empty($this->options['apiKey'])) {
            return $content;
        }

        if (!$this->options['autoEnable']) {
            return $content;
        }

        if (!$this->is_markdown_content($content)) {
            return $content;
        }

        $json_ld = $this->generate_json_ld($content);

        if ($json_ld) {
            $content .= $this->wrap_json_ld($json_ld);
        }

        return $content;
    }

    private function is_markdown_content($content)
    {
        $plain_text = strip_tags($content);

        foreach ($this->markdown_patterns as $pattern) {
            if (preg_match($pattern, $plain_text)) {
                return true;
            }
        }

        return false;
    }

    private function generate_json_ld($content)
    {
        $title = $this->extract_title($content);
        $excerpt = $this->extract_excerpt($content);
        $publish_date = $this->extract_date($content);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $title,
            'description' => $excerpt,
            'datePublished' => $publish_date,
            'processor' => [
                '@type' => 'SoftwareApplication',
                'name' => 'SemantiCraft',
                'version' => SEMANTICRAFT_VERSION
            ]
        ];

        return json_encode($schema, JSON_UNESCAPED_SLASHES);
    }

    private function extract_title($content)
    {
        if (preg_match('/<h[1-6][^>]*>(.+?)<\/h[1-6]>/i', $content, $matches)) {
            return strip_tags($matches[1]);
        }

        if (preg_match('/^#\s+(.+)$/m', $content, $matches)) {
            return trim($matches[1]);
        }

        return get_the_title();
    }

    private function extract_excerpt($content)
    {
        if (preg_match('/<excerpt[^>]*>(.+?)<\/excerpt>/is', $content, $matches)) {
            return strip_tags($matches[1]);
        }

        $excerpt = get_the_excerpt();

        if (!empty($excerpt)) {
            return $excerpt;
        }

        $plain_text = strip_tags($content);
        $plain_text = preg_replace('/^#+\s+/m', '', $plain_text);
        $plain_text = preg_replace('/[*_]{1,2}/', '', $plain_text);

        return substr(trim($plain_text), 0, 160);
    }

    private function extract_date($content)
    {
        $post = get_post();

        if ($post) {
            return get_the_date('c', $post);
        }

        return date('c');
    }

    private function wrap_json_ld($json_ld)
    {
        return sprintf(
            '<script type="application/ld+json" class="semanticraft-jsonld" data-api-key="%s">%s</script>',
            esc_attr($this->options['apiKey']),
            $json_ld
        );
    }

    public function get_selectors()
    {
        return $this->options['contentSelectors'];
    }

    public function is_api_configured()
    {
        return !empty($this->options['apiKey']);
    }
}