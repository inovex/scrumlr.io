{{/* Generate basic labels */}}
{{- define "labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ .Release.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end -}}
{{/* */}}
{{- define "selectorLabels" -}}
app.kubernetes.io/name: {{ include "scrumlr-fullname" .}}
app.kubernetes.io/components: {{ .name }}
app: {{ include "scrumlr-fullname" .}}
{{- end -}}
{{- define "scrumlr-fullname" -}}
{{- printf "%s-%s" "scrumlr" .name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
