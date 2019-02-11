# mi-website-2018
Website der Medieninformatik Studiengänge am Campus Gummersbach.

## Local Dev

### Start Server 
```hugo serve```


## Links
- [Image Processing](https://gohugo.io/content-management/image-processing/)

{{< imgproc sunset Resize "300x" />}}

https://google.github.io/material-design-icons/


{{ with .Site.GetPage "/blog" }}
{{ with .GetPage "my-post.md" }}{{ .Title }}{{ end }}
{{ end }}


+++
series: golang
+++
{{ range where .Site.Pages "Params.series" "golang" }}
   {{ .Content }}
{{ end }}


{{ $teaser := string .Params.teaser_image }}