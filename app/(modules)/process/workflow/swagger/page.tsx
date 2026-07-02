import { SwaggerUiIframe } from '@/components/swagger-ui-iframe'

export default function WorkflowSwaggerPage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <SwaggerUiIframe
        title="Workflow Swagger UI"
        className="h-full w-full border-0"
        openApiUrl="/api/process/workflow/openapi.json"
      />
    </div>
  )
}
