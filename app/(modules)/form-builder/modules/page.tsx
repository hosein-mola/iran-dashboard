import Link from 'next/link'
import { ArrowRight, Layers3 } from 'lucide-react'

import { GetFormModuleCatalog } from '@/actions/form'
import FormModuleCatalogManager from '@/components/FormModuleCatalogManager'
import { Button } from '@/components/ui/button'

export default async function FormBuilderModulesPage() {
  const catalog = await GetFormModuleCatalog()

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <header
        dir="rtl"
        className="border-border/60 bg-card/90 rounded-lg border p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Layers3 className="size-4" />
              کاتالوگ فرم
            </p>
            <h1 className="text-3xl font-bold">زیرماژول‌ها و قالب‌ها</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/form-builder">
              <ArrowRight className="size-4" />
              فرم‌ساز
            </Link>
          </Button>
        </div>
      </header>
      <FormModuleCatalogManager catalog={catalog} />
    </div>
  )
}
