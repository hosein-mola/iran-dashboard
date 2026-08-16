'use client'

import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Braces,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Eye,
  FileCheck2,
  Fingerprint,
  KeyRound,
  Layers3,
  ListChecks,
  LockKeyhole,
  Network,
  PlayCircle,
  Route,
  Search,
  ShieldCheck,
  ShieldQuestion,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
  UserCog,
  Workflow,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const healthCards = [
  {
    label: 'پوشش سیاست‌ها',
    value: '۸۷٪',
    helper: 'روی ماژول‌های اصلی',
    icon: ShieldCheck,
    tone: 'text-primary',
    progress: 87,
  },
  {
    label: 'درخواست‌های نیازمند تایید',
    value: '۲۴',
    helper: 'در صف مدیران دامنه',
    icon: Clock3,
    tone: 'text-amber-600',
    progress: 54,
  },
  {
    label: 'ریسک دسترسی بالا',
    value: '۶',
    helper: 'نیازمند بازبینی امروز',
    icon: AlertTriangle,
    tone: 'text-rose-600',
    progress: 31,
  },
  {
    label: 'تصمیم‌های خودکار',
    value: '۱۲.۸k',
    helper: 'در ۲۴ ساعت اخیر',
    icon: Activity,
    tone: 'text-emerald-600',
    progress: 92,
  },
]

const policyLayers = [
  {
    title: 'Subject',
    faTitle: 'کاربر و نقش سازمانی',
    description: 'واحد، سمت، سطح محرمانگی، وضعیت استخدام و delegation.',
    icon: UserCog,
    sample: 'user.department == resource.ownerUnit',
  },
  {
    title: 'Resource',
    faTitle: 'منبع و دامنه داده',
    description: 'ماژول، فرم، رکورد، فیلد حساس، workspace کد یا workflow.',
    icon: Database,
    sample: 'resource.module in ["forms", "workflow"]',
  },
  {
    title: 'Action',
    faTitle: 'عملیات قابل کنترل',
    description: 'مشاهده، ویرایش، اجرا، انتشار، تایید، export و حذف.',
    icon: KeyRound,
    sample: 'action == "publish" requires approval',
  },
  {
    title: 'Context',
    faTitle: 'شرایط لحظه‌ای',
    description: 'زمان، IP، device trust، سطح ریسک، وضعیت workflow و محیط اجرا.',
    icon: Fingerprint,
    sample: 'risk.score < 40 && network.zone == "trusted"',
  },
]

const moduleScopes = [
  {
    module: 'فرم‌ساز',
    detail: 'قالب، نسخه فرم، submission، رویدادهای custom',
    icon: Layers3,
    allowed: ['طراحی', 'انتشار', 'مشاهده داده', 'خروجی'],
    coverage: 91,
  },
  {
    module: 'Workflow',
    detail: 'تعریف فرایند، transition، تایید موازی، delegation',
    icon: Workflow,
    allowed: ['شروع', 'تایید', 'برگشت', 'لغو'],
    coverage: 84,
  },
  {
    module: 'Code Runner',
    detail: 'workspace، job اجرا، secret، log، artifact',
    icon: Code2,
    allowed: ['اجرا', 'deploy', 'مشاهده log', 'مدیریت worker'],
    coverage: 78,
  },
  {
    module: 'گزارش و داده',
    detail: 'داشبورد، جدول، ستون حساس، گزارش مدیریتی',
    icon: FileCheck2,
    allowed: ['خواندن', 'فیلتر', 'export', 'اشتراک‌گذاری'],
    coverage: 88,
  },
]

const workflowSteps = [
  {
    name: 'درخواست دسترسی',
    owner: 'کاربر یا مدیر ماژول',
    status: 'ثبت خودکار context',
    icon: Search,
  },
  {
    name: 'ارزیابی ABAC',
    owner: 'Policy Decision Point',
    status: 'تصمیم allow / deny / review',
    icon: SlidersHorizontal,
  },
  {
    name: 'تایید دامنه',
    owner: 'مالک فرایند یا داده',
    status: 'قابل delegation',
    icon: BadgeCheck,
  },
  {
    name: 'اعمال و ممیزی',
    owner: 'Policy Enforcement Point',
    status: 'ثبت obligation و audit',
    icon: LockKeyhole,
  },
]

const policies = [
  {
    name: 'انتشار فرم مالی',
    effect: 'نیازمند تایید',
    condition: 'کاربر باید مالک زیرماژول باشد و نسخه فرم تست موفق داشته باشد.',
    target: 'form-builder.publish',
    badge: 'Workflow gated',
  },
  {
    name: 'اجرای کد با secret',
    effect: 'مجاز با محدودیت',
    condition: 'فقط در network مورد اعتماد، با quota فعال و worker غیر production.',
    target: 'code-runner.execute',
    badge: 'Context aware',
  },
  {
    name: 'خروجی گزارش پرسنلی',
    effect: 'بازبینی اجباری',
    condition: 'اگر فیلد ملی، حقوق یا شماره تماس در export باشد، تایید مدیر داده لازم است.',
    target: 'reports.export',
    badge: 'Data masking',
  },
]

const simulation = [
  { label: 'کاربر', value: 'کارشناس بهره‌برداری - واحد تهران' },
  { label: 'منبع', value: 'فرم گزارش روزانه / زیرماژول تولید' },
  { label: 'عملیات', value: 'ویرایش و ارسال به workflow' },
  { label: 'شرایط', value: 'شبکه داخلی، ریسک پایین، خارج از ساعات اداری' },
]

const decisions = [
  {
    title: 'ویرایش فرم',
    result: 'Allow',
    icon: CheckCircle2,
    className: 'text-emerald-600',
    reason: 'واحد کاربر با مالک منبع هم‌خوان است.',
  },
  {
    title: 'انتشار مستقیم',
    result: 'Review',
    icon: ShieldQuestion,
    className: 'text-amber-600',
    reason: 'انتشار خارج از ساعات اداری نیازمند تایید مدیر است.',
  },
  {
    title: 'حذف submission',
    result: 'Deny',
    icon: XCircle,
    className: 'text-rose-600',
    reason: 'عملیات حذف برای این نقش تعریف نشده است.',
  },
]

const obligations = [
  'ثبت دلیل دسترسی برای عملیات حساس',
  'ماسک کردن فیلدهای ملی و مالی در export',
  'محدود کردن job اجرای کد به ۱۵ دقیقه',
  'ارسال رخدادهای deny به لاگ امنیتی',
]

const permissionSteps = [
  {
    title: '۱. انتخاب گیرنده دسترسی',
    description: 'کاربر، تیم، نقش سازمانی یا service account را انتخاب کنید.',
    example: 'گروه: کارشناسان بهره‌برداری تهران',
    icon: UserCog,
  },
  {
    title: '۲. انتخاب بخش SaaS',
    description: 'ماژول، زیرماژول، فرم، workflow، workspace کد یا گزارش را مشخص کنید.',
    example: 'فرم‌ساز / زیرماژول تولید / فرم گزارش روزانه',
    icon: Layers3,
  },
  {
    title: '۳. انتخاب عملیات',
    description: 'نوع کاری که مجاز است انجام شود را جداگانه فعال کنید.',
    example: 'مشاهده، ویرایش، ارسال به workflow، export',
    icon: KeyRound,
  },
  {
    title: '۴. اضافه کردن شرط',
    description: 'دسترسی را به واحد، مالک داده، ساعت کاری، شبکه یا سطح ریسک محدود کنید.',
    example: 'فقط اگر user.unit == resource.ownerUnit',
    icon: Fingerprint,
  },
  {
    title: '۵. تعیین تایید و ممیزی',
    description: 'برای عملیات حساس، تایید مدیر، دلیل دسترسی و لاگ اجباری بگذارید.',
    example: 'انتشار فرم مالی نیازمند تایید مدیر داده',
    icon: BadgeCheck,
  },
]

const permissionMatrix = [
  {
    area: 'فرم‌ساز',
    resource: 'ماژول، قالب، فرم، نسخه، فیلد، submission',
    actions: [
      { label: 'مشاهده', icon: Eye },
      { label: 'طراحی', icon: SlidersHorizontal },
      { label: 'انتشار', icon: UploadCloud },
      { label: 'حذف', icon: Trash2 },
    ],
    condition: 'زیرماژول، مالک فرم، وضعیت انتشار، فیلد حساس',
    approval: 'انتشار و حذف نیازمند تایید مالک داده',
  },
  {
    area: 'Workflow',
    resource: 'تعریف فرایند، گره، transition، task، instance',
    actions: [
      { label: 'شروع', icon: PlayCircle },
      { label: 'تایید', icon: BadgeCheck },
      { label: 'برگشت', icon: Route },
      { label: 'لغو', icon: XCircle },
    ],
    condition: 'مرحله فعلی، assignee، delegation، SLA',
    approval: 'تایید خارج از نوبت با دلیل اجباری ثبت می‌شود',
  },
  {
    area: 'Code Runner',
    resource: 'workspace، job، secret، worker، log، artifact',
    actions: [
      { label: 'مشاهده log', icon: Eye },
      { label: 'اجرا', icon: PlayCircle },
      { label: 'deploy', icon: UploadCloud },
      { label: 'توقف job', icon: XCircle },
    ],
    condition: 'محیط اجرا، quota، secret scope، شبکه مورد اعتماد',
    approval: 'deploy و secret access نیازمند تایید فنی',
  },
  {
    area: 'گزارش‌ها و داده',
    resource: 'داشبورد، جدول، ستون، گزارش، export',
    actions: [
      { label: 'خواندن', icon: Eye },
      { label: 'فیلتر', icon: Search },
      { label: 'export', icon: UploadCloud },
      { label: 'اشتراک', icon: Network },
    ],
    condition: 'طبقه‌بندی داده، ستون حساس، واحد سازمانی',
    approval: 'export داده حساس با ماسک و تایید مدیر داده',
  },
]

const builderPreview = [
  { label: 'گیرنده', value: 'نقش: مدیر زیرماژول تولید' },
  { label: 'منبع', value: 'فرم‌ساز > فرم گزارش روزانه > همه نسخه‌ها' },
  { label: 'عملیات', value: 'مشاهده، ویرایش، انتشار با تایید' },
  { label: 'شرط', value: 'واحد کاربر باید با مالک فرم برابر باشد' },
  { label: 'مدت اعتبار', value: '۹۰ روز، بازبینی خودکار هر ماه' },
]

export default function SecurityPage() {
  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4"
    >
      <div className="from-background via-background to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-10 space-y-6">
        <div className="bg-background/98 sticky top-0 z-[180] space-y-4 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/80 rounded-xl border p-4 shadow-md backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                  <ShieldCheck className="text-primary size-4" />
                  <span>مرکز امنیت و سیاست دسترسی</span>
                  <Badge variant="outline">ABAC آماده اتصال به Backend</Badge>
                </div>
                <h1 className="text-3xl font-bold">کنسول مدیریت دسترسی هوشمند</h1>
                <p className="text-muted-foreground max-w-4xl text-sm leading-7">
                  این نما مدل واقعی Attribute-Based Access Control را برای
                  برنامه‌های چندماژوله نمایش می‌دهد: فرم‌ساز، workflow، اجرای
                  کد، گزارش‌ها و منابع داده از یک لایه سیاست واحد کنترل می‌شوند.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/logs">
                    لاگ امنیتی
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/dashboard/persons">
                    کاربران و واحدها
                    <UserCog className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </header>
        </div>

        <section className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
          {healthCards.map((card) => (
            <Card
              key={card.label}
              dir="rtl"
              className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <div className="space-y-1">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {card.value}
                  </CardTitle>
                </div>
                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <card.icon className={`size-5 ${card.tone}`} />
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <Progress value={card.progress} />
                <p className="text-muted-foreground text-xs">{card.helper}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card
            dir="rtl"
            className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Network className="text-primary size-5" />
                    معماری تصمیم‌گیری ABAC
                  </CardTitle>
                  <CardDescription>
                    سیاست‌ها با ترکیب کاربر، منبع، عملیات و شرایط تصمیم می‌گیرند.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Policy-as-UI</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid flex-1 items-stretch gap-3 md:grid-cols-2">
              {policyLayers.map((layer) => (
                <div
                  key={layer.title}
                  dir="rtl"
                  className="border-border/60 bg-background/40 flex h-full flex-col rounded-lg border p-3 text-right"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                        <layer.icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{layer.faTitle}</p>
                        <p className="text-muted-foreground text-xs" dir="ltr">
                          {layer.title}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground min-h-10 text-sm leading-6">
                    {layer.description}
                  </p>
                  <div
                    dir="ltr"
                    className="bg-muted text-muted-foreground mt-3 rounded-md px-3 py-2 text-left font-mono text-xs"
                  >
                    {layer.sample}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card
            dir="rtl"
            className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Route className="text-primary size-5" />
                مسیر درخواست دسترسی
              </CardTitle>
              <CardDescription>
                مناسب برای دسترسی موقت، انتشار فرم، اجرای کد و تایید workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.name}
                  dir="rtl"
                  className="border-border/60 bg-background/40 flex gap-3 rounded-lg border p-3 text-right"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                      <step.icon className="size-4" />
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <span className="bg-border h-8 w-px" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold">{step.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {step.owner}
                    </p>
                    <Badge variant="outline">{step.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card
            dir="rtl"
            className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <UserCog className="text-primary size-5" />
                چطور دسترسی می‌دهید؟
              </CardTitle>
              <CardDescription>
                در UI نهایی، مدیر از بالا به پایین یک سیاست قابل فهم می‌سازد.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {permissionSteps.map((step) => (
                <div
                  key={step.title}
                  dir="rtl"
                  className="border-border/60 bg-background/40 rounded-lg border p-3 text-right"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                      <step.icon className="size-4" />
                    </div>
                    <p className="font-semibold">{step.title}</p>
                  </div>
                  <p className="text-muted-foreground text-sm leading-6">
                    {step.description}
                  </p>
                  <p className="text-primary mt-2 text-xs font-medium">
                    نمونه: {step.example}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card
            dir="rtl"
            className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
          >
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <SlidersHorizontal className="text-primary size-5" />
                    پیش‌نمایش فرم اعطای دسترسی
                  </CardTitle>
                  <CardDescription>
                    این فرم نشان می‌دهد admin دقیقاً چه چیزهایی را انتخاب می‌کند.
                  </CardDescription>
                </div>
                <Badge>UI-only draft</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="grid items-stretch gap-3 md:grid-cols-2">
                {builderPreview.map((item) => (
                  <div
                    key={item.label}
                    dir="rtl"
                    className="border-border/60 h-full rounded-lg border p-3 text-right"
                  >
                    <p className="text-muted-foreground mb-1 text-xs">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium leading-6">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted/70 rounded-lg p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">نتیجه سیاست ساخته‌شده</p>
                  <Badge variant="outline" dir="ltr">
                    allow-with-approval
                  </Badge>
                </div>
                <div
                  dir="ltr"
                  className="bg-background text-muted-foreground rounded-md px-3 py-2 text-left font-mono text-xs leading-6"
                >
                  allow if subject.role == "module_manager" && subject.unit ==
                  resource.ownerUnit && action in ["read", "update", "publish"]
                </div>
              </div>
              <div className="grid items-stretch gap-3 md:grid-cols-3">
                <Button variant="outline">
                  ذخیره پیش‌نویس
                  <FileCheck2 className="size-4" />
                </Button>
                <Button variant="outline">
                  تست با کاربر نمونه
                  <PlayCircle className="size-4" />
                </Button>
                <Button>
                  ارسال برای تایید
                  <BadgeCheck className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="grant" className="space-y-4">
          <TabsList className="border-border/60 bg-card/90 mr-0 ml-auto grid h-auto w-full grid-cols-2 border p-1 md:w-fit md:grid-cols-5">
            <TabsTrigger value="grant">اعطای دسترسی</TabsTrigger>
            <TabsTrigger value="policies">سیاست‌ها</TabsTrigger>
            <TabsTrigger value="coverage">پوشش ماژول‌ها</TabsTrigger>
            <TabsTrigger value="simulate">شبیه‌ساز تصمیم</TabsTrigger>
            <TabsTrigger value="governance">حاکمیت</TabsTrigger>
          </TabsList>

          <TabsContent value="grant" className="space-y-4">
            <Card
              dir="rtl"
              className="border-border/60 bg-card/90 rounded-lg border text-right shadow-sm backdrop-blur"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <KeyRound className="text-primary size-5" />
                  ماتریس دسترسی هر بخش SaaS
                </CardTitle>
                <CardDescription>
                  برای هر بخش مشخص می‌کنید منبع چیست، چه عملیات‌هایی قابل
                  انتخاب است، چه شرطی لازم است و چه چیزی باید تایید شود.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {permissionMatrix.map((row) => (
                  <div
                    key={row.area}
                    dir="rtl"
                    className="border-border/60 bg-background/40 rounded-lg border p-3 text-right"
                  >
                    <div className="grid items-start gap-4 lg:grid-cols-[0.7fr_1fr_1.1fr_1fr]">
                      <div className="space-y-1">
                        <p className="font-semibold">{row.area}</p>
                        <p className="text-muted-foreground text-xs leading-5">
                          {row.resource}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-xs">
                          عملیات‌های قابل اعطا
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {row.actions.map((action) => (
                            <Badge key={action.label} variant="outline">
                              <action.icon className="size-3" />
                              {action.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                          شرط‌های پیشنهادی
                        </p>
                        <p className="text-sm leading-6">{row.condition}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                          تایید و ممیزی
                        </p>
                        <p className="text-sm leading-6">{row.approval}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              <Card
                dir="rtl"
                className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    دسترسی مستقیم
                  </CardTitle>
                  <CardDescription>
                    برای عملیات کم‌ریسک مثل مشاهده داشبورد عمومی.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-2 text-sm">
                  <Badge variant="outline">Allow</Badge>
                  <p className="text-muted-foreground leading-6">
                    مدیر گیرنده، منبع و action را انتخاب می‌کند؛ سیستم بدون
                    workflow اعمال می‌کند اما audit ثبت می‌شود.
                  </p>
                </CardContent>
              </Card>

              <Card
                dir="rtl"
                className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    دسترسی مشروط
                  </CardTitle>
                  <CardDescription>
                    برای کارهای روزمره که باید محدود به context باشند.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-2 text-sm">
                  <Badge variant="outline">Allow when...</Badge>
                  <p className="text-muted-foreground leading-6">
                    شرط‌هایی مثل واحد سازمانی، مالکیت منبع، شبکه داخلی، ساعت
                    کاری و مدت اعتبار به سیاست اضافه می‌شود.
                  </p>
                </CardContent>
              </Card>

              <Card
                dir="rtl"
                className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    دسترسی با تایید
                  </CardTitle>
                  <CardDescription>
                    برای انتشار، حذف، export حساس و اجرای کد.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-2 text-sm">
                  <Badge variant="outline">Review required</Badge>
                  <p className="text-muted-foreground leading-6">
                    سیستم درخواست را به workflow می‌فرستد، دلیل دسترسی را می‌گیرد
                    و بعد از تایید policy را فعال می‌کند.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              {policies.map((policy) => (
                <Card
                  key={policy.name}
                  dir="rtl"
                  className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold">
                          {policy.name}
                        </CardTitle>
                        <CardDescription dir="ltr" className="text-right">
                          {policy.target}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{policy.badge}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground text-sm">
                        نتیجه پیش‌فرض
                      </span>
                      <Badge>{policy.effect}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm leading-7">
                      {policy.condition}
                    </p>
                    <Button variant="outline" className="w-full">
                      <Braces className="size-4" />
                      مشاهده شرط سیاست
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
              {moduleScopes.map((scope) => (
                <Card
                  key={scope.module}
                  dir="rtl"
                  className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                          <scope.icon className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            {scope.module}
                          </CardTitle>
                          <CardDescription>{scope.detail}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {scope.coverage.toLocaleString('fa-IR')}٪
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <Progress value={scope.coverage} />
                    <div className="flex flex-wrap gap-2">
                      {scope.allowed.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="simulate" className="space-y-4">
            <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <Card
                dir="rtl"
                className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <PlayCircle className="text-primary size-5" />
                    سناریوی نمونه
                  </CardTitle>
                  <CardDescription>
                    برای MVP فقط UI پیاده‌سازی شده و داده‌ها ثابت هستند.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {simulation.map((item) => (
                    <div
                      key={item.label}
                      dir="rtl"
                      className="border-border/60 flex items-start justify-between gap-3 rounded-lg border p-3 text-right"
                    >
                      <span className="text-muted-foreground text-sm">
                        {item.label}
                      </span>
                      <span className="max-w-72 text-right text-sm font-medium">
                        {item.value}
                      </span>
                    </div>
                  ))}
                  <Button className="w-full">
                    اجرای تست سیاست
                    <Sparkles className="size-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card
                dir="rtl"
                className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    نتیجه تصمیم‌گیری
                  </CardTitle>
                  <CardDescription>
                    مدیر می‌بیند کدام عملیات مجاز، رد یا نیازمند workflow است.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {decisions.map((decision) => (
                    <div
                      key={decision.title}
                      dir="rtl"
                      className="border-border/60 bg-background/40 rounded-lg border p-3 text-right"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <decision.icon
                            className={`size-5 ${decision.className}`}
                          />
                          <p className="font-semibold">{decision.title}</p>
                        </div>
                        <Badge variant="outline" dir="ltr">
                          {decision.result}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-6">
                        {decision.reason}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <section className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              <Card
                dir="rtl"
                className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur lg:col-span-2"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <ListChecks className="text-primary size-5" />
                    تعهدات اجرایی و کنترل‌های جانبی
                  </CardTitle>
                  <CardDescription>
                    ABAC فقط allow و deny نیست؛ obligation رفتار سیستم بعد از
                    تصمیم را مشخص می‌کند.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid flex-1 items-stretch gap-3 md:grid-cols-2">
                  {obligations.map((item) => (
                    <div
                      key={item}
                      dir="rtl"
                      className="border-border/60 flex h-full items-start gap-3 rounded-lg border p-3 text-right"
                    >
                      <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                      <p className="text-sm leading-6">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card
                dir="rtl"
                className="border-border/60 bg-card/90 flex h-full flex-col rounded-lg border text-right shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Building2 className="text-primary size-5" />
                    وضعیت آماده‌سازی
                  </CardTitle>
                  <CardDescription>
                    گزینه‌هایی که در فاز بعد به API و دیتابیس وصل می‌شوند.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  {[
                    'Policy versioning',
                    'Approval workflow',
                    'Risk scoring',
                    'Audit export',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm" dir="ltr">
                        {item}
                      </span>
                      <Switch defaultChecked={index !== 2} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
