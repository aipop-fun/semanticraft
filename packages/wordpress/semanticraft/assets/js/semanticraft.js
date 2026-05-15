(function($) {
    'use strict';

    var SemantiCraft = {
        initialized: false,
        apiKey: '',
        selectors: '',

        init: function(options) {
            this.apiKey = options.apiKey || '';
            this.selectors = options.selectors || '.entry-content, .post-content, article';
            this.initialized = true;
            this.bindEvents();
        },

        bindEvents: function() {
            $(document).ready(function() {
                SemantiCraft.processContent();
            });
        },

        processContent: function() {
            var elements = $(SemantiCraft.selectors);

            elements.each(function() {
                var $el = $(this);
                var content = $el.html();

                if ($el.data('semanticraft-processed')) {
                    return;
                }

                $el.data('semanticraft-processed', true);
            });
        },

        analyzeMarkdown: function(content) {
            var patterns = {
                headers: /^#{1,6}\s+(.+)$/gm,
                links: /\[([^\]]+)\]\(([^\)]+)\)/g,
                bold: /\*\*([^*]+)\*\*/g,
                italic: /\*([^*]+)\*/g,
                code: /```([\s\S]*?)```/g,
                lists: /^\s*[-*+]\s+(.+)$/gm
            };

            var result = {
                hasMarkdown: false,
                elements: {}
            };

            Object.keys(patterns).forEach(function(key) {
                var matches = content.match(patterns[key]);
                if (matches && matches.length > 0) {
                    result.elements[key] = matches;
                    result.hasMarkdown = true;
                }
            });

            return result;
        },

        injectStructuredData: function(schema) {
            var existing = $('script.semanticraft-jsonld');

            if (existing.length) {
                existing.text(JSON.stringify(schema));
            } else {
                var script = document.createElement('script');
                script.type = 'application/ld+json';
                script.className = 'semanticraft-jsonld';
                script.textContent = JSON.stringify(schema);
                document.head.appendChild(script);
            }
        },

        getApiKey: function() {
            return this.apiKey;
        }
    };

    window.SemantiCraft = SemantiCraft;

    if (typeof window.semanticraftData !== 'undefined') {
        SemantiCraft.init(window.semanticraftData);
    }

})(jQuery);