# Hugo PowerSlides

A lightweight Markdown slide theme for Hugo.

The theme is designed to be easy to maintain, customize, and extend without dependencies.

## Requirements

- Hugo Extended
- Go
- Git

Check your installation:

```bash
hugo version
go version
```

## Using the theme

Add the theme module to the site's `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/npellegrin/hugo-powerslides"
```

Initialize the site's Hugo module if necessary:

```bash
hugo mod init example.com/my-slides
```

Download the theme:

```bash
hugo mod get github.com/npellegrin/hugo-powerslides
hugo mod tidy
```

Run Hugo:

```bash
hugo server
```
