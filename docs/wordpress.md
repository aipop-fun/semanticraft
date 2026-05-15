# WordPress Plugin

Plugin WordPress para SemantiCraft.

## Requisitos

- WordPress 6.0+
- PHP 8.0+
- PHP Extensions: json, curl

## Instalação

### Via Admin

1. Baixe o plugin
2. Acesse Plugins > Adicionar Novo > Enviar
3. Ative o plugin

### Via WP-CLI

```bash
wp plugin install semanticraft --activate
```

### Manual

1. Descompacte em `/wp-content/plugins/semanticraft/`
2. Ative pelo admin

## Configuração

### Settings

Acesse **Settings > SemantiCraft**:

| Setting | Descrição |
|---------|----------|
| API Key | Chave da API (opcional) |
| Auto Parse | Parsear posts automaticamente |
| Threshold | Nível mínimo de confiança |
| Output Position | Onde injetar JSON-LD |

### Gutenberg Block

Adicione o bloco **SemantiCraft** ao post:

```markdown
<!-- wp:semanticraft/parse -->
# Meu Produto

**Preço:** R$ 99
<!-- /wp:semanticraft/parse -->
```

### Shortcode

```[semanticraft]markdown content[/semanticraft]```

```[semanticraft]
# iPhone 15

**Preço:** R$ 9.499
**Cor:** Azul
[/semanticraft]
```

## Filtros

### semanticraft_parse_content

Personaliza o parsing:

```php
add_filter('semanticraft_parse_content', function($result, $markdown) {
  $result['metadata']['source'] = 'wordpress';
  return $result;
}, 10, 2);
```

### semanticraft_entity_types

Filtra tipos de entidade:

```php
add_filter('semanticraft_entity_types', function($types) {
  $types[] = 'CustomType';
  return $types;
});
```

### semanticraft_api_endpoint

Muda endpoint da API:

```php
add_filter('semanticraft_api_endpoint', function($endpoint) {
  return 'https://api.custom.com/parse';
});
```

## REST API

### GET /semanticraft/v1/parse

```php
$response = wp_remote_post('https://example.com/wp-json/semanticraft/v1/parse', [
  'body' => [
    'markdown' => '# Title\n\nContent',
  ],
]);
```

### GET /semanticraft/v1/validate

```php
$response = wp_remote_post('https://example.com/wp-json/semanticraft/v1/validate', [
  'body' => [
    'schema' => $schema,
  ],
]);
```

## Hooks

### semanticraft_entity_parsed

Dispara após parsear entidade:

```php
add_action('semanticraft_entity_parsed', function($entity) {
  if ($entity['type'] === 'Product') {
    // Log analytics
    do_action('track_product_view', $entity);
  }
}, 10, 1);
```

### semanticraft_schema_generated

Dispara após gerar schema:

```php
add_action('semanticraft_schema_generated', function($schema) {
  // Invalidate cache
  clean_post_cache(get_the_ID());
}, 10, 1);
```

## CLI Commands

```bash
wp semanticraft parse ./post.md
```

```bash
wp semanticraft validate ./schema.json
```

```bash
wp semanticraft regenerate --post_type=post
```

```bash
wp semanticraft stats
```

## Troubleshooting

### ERRO: JSON-LD não aparece

1. Verifique se o plugin está ativo
2. Check "Auto Parse" nas configurações
3. Verifique o código-fonte da página para JSON-LD

### ERRO: Parse falha

Verifique o log de erros:

```bash
tail -f /wp-content/debug.log
```

### Performance lenta

Use cache:

```php
add_filter('semanticraft_use_cache', '__return_true');
```

## Helpers

### PHP API

```php
$schema = \SemantiCraft\parse_markdown($markdown);

$entities = \SemantiCraft\get_entities($schema, 'Product');

$products = array_filter(
  $entities,
  fn($e) => $e['type'] === 'Product'
);
```

### Template Tags

```php
<?php if (function_exists('semanticraft_the_intent')): ?>
  <span><?php semanticraft_the_intent('primary'); ?></span>
<?php endif; ?>
```

```php
<?php if (function_exists('semanticraft_the_confidence')): ?>
  <span>Confidence: <?php semanticraft_the_confidence(); ?></span>
<?php endif; ?>
```