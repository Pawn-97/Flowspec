import { useMemo, useState } from "react"
import {
  AddressBook,
  ArrowRight,
  CheckCircle,
  ClipboardText,
  ClockCounterClockwise,
  FloppyDisk,
  HouseLine,
  Info,
  MagnifyingGlass,
  Phone,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type ScreenId =
  | "select-business-address"
  | "enter-port-in-numbers"
  | "number-precheck-result"
  | "review-port-request"
  | "submit-success"

type ScenarioKey = "happy" | "blocked" | "error" | "warning" | "partial_success"
type ExternalDestination =
  | "external-business-address-documents"
  | "external-port-history-entry"
  | "assign-pac"
  | null

type ParsedRow = {
  id: string
  number: string
  format: "Valid" | "Invalid"
  duplicate: "No" | "Yes"
  eligibility: "Ready for pre-check" | "Needs correction"
  status: "ready" | "error"
  issue?: string
}

type PrecheckRow = {
  id: string
  number: string
  carrier: string
  eligibility: "Eligible" | "Failed"
  issue: string
  status: "pass" | "fail"
}

const screens: Array<{ id: ScreenId; title: string; shortTitle: string }> = [
  {
    id: "select-business-address",
    title: "Select verified business address",
    shortTitle: "Address",
  },
  {
    id: "enter-port-in-numbers",
    title: "Enter port-in numbers",
    shortTitle: "Numbers",
  },
  {
    id: "number-precheck-result",
    title: "Number pre-check result",
    shortTitle: "Pre-check",
  },
  {
    id: "review-port-request",
    title: "Review port request",
    shortTitle: "Review",
  },
  {
    id: "submit-success",
    title: "Submit success",
    shortTitle: "Success",
  },
]

const verifiedAddresses = [
  {
    id: "addr-lon",
    address: "14 Bishopsgate, London EC2N 4BQ",
    country: "United Kingdom",
    status: "Verified",
    updated: "2026-06-20",
  },
  {
    id: "addr-man",
    address: "3 Hardman Street, Manchester M3 3HF",
    country: "United Kingdom",
    status: "Verified",
    updated: "2026-06-12",
  },
]

const defaultNumbers = "+447700900101\n+447700900102\n+447700900103"
const invalidNumbers = "+447700900101\n7700-INVALID\n+447700900101"
const carriers = ["O2 Business", "Vodafone Business", "EE Business"]

const scenarioLabels: Array<{ key: ScenarioKey; label: string }> = [
  { key: "happy", label: "Happy path" },
  { key: "blocked", label: "Blocked" },
  { key: "error", label: "Error" },
  { key: "warning", label: "Warning" },
  { key: "partial_success", label: "Partial success" },
]

function parseNumbers(value: string): ParsedRow[] {
  const lines = value
    .split(/\n|,|;/)
    .map((line) => line.trim())
    .filter(Boolean)
  const counts = lines.reduce<Record<string, number>>((acc, line) => {
    const normalized = line.replace(/\s/g, "")
    acc[normalized] = (acc[normalized] ?? 0) + 1
    return acc
  }, {})

  return lines.map((line, index) => {
    const normalized = line.replace(/\s/g, "")
    const isValid = /^(\+44|0)7\d{9}$/.test(normalized)
    const isDuplicate = counts[normalized] > 1
    const issue = !isValid
      ? "Use a UK mobile format such as +447700900101."
      : isDuplicate
        ? "Remove duplicate before pre-check."
        : undefined

    return {
      id: `${normalized}-${index}`,
      number: line,
      format: isValid ? "Valid" : "Invalid",
      duplicate: isDuplicate ? "Yes" : "No",
      eligibility: isValid && !isDuplicate ? "Ready for pre-check" : "Needs correction",
      status: isValid && !isDuplicate ? "ready" : "error",
      issue,
    }
  })
}

function makePrecheckRows(rows: ParsedRow[], includeFailure: boolean): PrecheckRow[] {
  return rows
    .filter((row) => row.status === "ready")
    .map((row, index) => {
      const shouldFail = includeFailure && index === rows.length - 1

      return {
        id: row.id,
        number: row.number,
        carrier: carriers[index % carriers.length],
        eligibility: shouldFail ? "Failed" : "Eligible",
        issue: shouldFail ? "Business-mobile eligibility could not be confirmed." : "No blocking issue",
        status: shouldFail ? "fail" : "pass",
      }
    })
}

function App() {
  const [screen, setScreen] = useState<ScreenId>("select-business-address")
  const [scenario, setScenario] = useState<ScenarioKey>("happy")
  const [selectedAddress, setSelectedAddress] = useState("addr-lon")
  const [addressValidation, setAddressValidation] = useState(false)
  const [numbersValue, setNumbersValue] = useState(defaultNumbers)
  const [numberValidationVisible, setNumberValidationVisible] = useState(false)
  const [precheckRows, setPrecheckRows] = useState<PrecheckRow[]>(
    makePrecheckRows(parseNumbers(defaultNumbers), false)
  )
  const [reviewWarning, setReviewWarning] = useState(false)
  const [cutoffIssue, setCutoffIssue] = useState(false)
  const [partialSuccess, setPartialSuccess] = useState(false)
  const [externalDestination, setExternalDestination] =
    useState<ExternalDestination>(null)

  const parsedRows = useMemo(() => parseNumbers(numbersValue), [numbersValue])
  const activeScreen = screens.find((item) => item.id === screen) ?? screens[0]
  const currentStepIndex = screens.findIndex((item) => item.id === screen)
  const hasNumberErrors = parsedRows.some((row) => row.status === "error")
  const hasPrecheckErrors = precheckRows.some((row) => row.status === "fail")
  const isBlockedScenario = scenario === "blocked"

  function resetFlow(nextScenario: ScenarioKey) {
    setScenario(nextScenario)
    setExternalDestination(null)
    setAddressValidation(false)
    setNumberValidationVisible(false)
    setCutoffIssue(false)

    if (nextScenario === "blocked") {
      setScreen("select-business-address")
      setSelectedAddress("")
      setNumbersValue(defaultNumbers)
      setPrecheckRows(makePrecheckRows(parseNumbers(defaultNumbers), false))
      setReviewWarning(false)
      setCutoffIssue(false)
      setPartialSuccess(false)
      return
    }

    if (nextScenario === "error") {
      setScreen("enter-port-in-numbers")
      setSelectedAddress("addr-lon")
      setNumbersValue(invalidNumbers)
      setPrecheckRows(makePrecheckRows(parseNumbers(defaultNumbers), true))
      setReviewWarning(false)
      setCutoffIssue(false)
      setPartialSuccess(false)
      return
    }

    if (nextScenario === "warning") {
      setScreen("review-port-request")
      setSelectedAddress("addr-lon")
      setNumbersValue(defaultNumbers)
      setPrecheckRows(makePrecheckRows(parseNumbers(defaultNumbers), false))
      setReviewWarning(true)
      setCutoffIssue(false)
      setPartialSuccess(false)
      return
    }

    if (nextScenario === "partial_success") {
      setScreen("submit-success")
      setSelectedAddress("addr-lon")
      setNumbersValue(defaultNumbers)
      setPrecheckRows(makePrecheckRows(parseNumbers(defaultNumbers), false))
      setReviewWarning(false)
      setCutoffIssue(false)
      setPartialSuccess(true)
      return
    }

    setScreen("select-business-address")
    setSelectedAddress("addr-lon")
    setNumbersValue(defaultNumbers)
    setPrecheckRows(makePrecheckRows(parseNumbers(defaultNumbers), false))
    setReviewWarning(false)
    setCutoffIssue(false)
    setPartialSuccess(false)
  }

  function continueFromAddress() {
    if (!selectedAddress || isBlockedScenario) {
      setAddressValidation(true)
      return
    }

    setAddressValidation(false)
    setScreen("enter-port-in-numbers")
  }

  function continueFromNumbers() {
    if (!parsedRows.length || hasNumberErrors) {
      setNumberValidationVisible(true)
      return
    }

    setNumberValidationVisible(false)
    setPrecheckRows(makePrecheckRows(parsedRows, scenario === "error"))
    setScreen("number-precheck-result")
  }

  function continueFromPrecheck() {
    if (hasPrecheckErrors) {
      return
    }

    setReviewWarning(scenario === "warning")
    setScreen("review-port-request")
  }

  function submitRequest() {
    setPartialSuccess(scenario === "partial_success")
    setScreen("submit-success")
  }

  function fixNumberFormat() {
    setNumbersValue(defaultNumbers)
    setNumberValidationVisible(false)
  }

  function resolvePrecheckRow(rowId: string) {
    setPrecheckRows((rows) =>
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              eligibility: "Eligible",
              issue: "No blocking issue",
              status: "pass",
            }
          : row
      )
    )
  }

  function removePrecheckRow(rowId: string) {
    setPrecheckRows((rows) => rows.filter((row) => row.id !== rowId))
  }

  function renderContent() {
    if (externalDestination) {
      return (
        <ExternalState
          destination={externalDestination}
          onResume={() => {
            setExternalDestination(null)
            setScenario("happy")
            setSelectedAddress("addr-lon")
            setScreen(
              externalDestination === "external-port-history-entry"
                ? "submit-success"
                : "select-business-address"
            )
          }}
        />
      )
    }

    if (screen === "select-business-address") {
      return (
        <AddressStep
          selectedAddress={selectedAddress}
          validationVisible={addressValidation}
          blocked={isBlockedScenario}
          onSelect={setSelectedAddress}
          onContinue={continueFromAddress}
          onExternalExit={() =>
            setExternalDestination("external-business-address-documents")
          }
        />
      )
    }

    if (screen === "enter-port-in-numbers") {
      return (
        <NumbersStep
          value={numbersValue}
          rows={parsedRows}
          validationVisible={numberValidationVisible}
          onChange={(value) => {
            setNumbersValue(value)
            setNumberValidationVisible(false)
          }}
          onFix={fixNumberFormat}
          onContinue={continueFromNumbers}
        />
      )
    }

    if (screen === "number-precheck-result") {
      return (
        <PrecheckStep
          rows={precheckRows}
          onFix={resolvePrecheckRow}
          onRemove={removePrecheckRow}
          onContinue={continueFromPrecheck}
        />
      )
    }

    if (screen === "review-port-request") {
      return (
        <ReviewStep
          selectedAddress={verifiedAddresses.find(
            (address) => address.id === selectedAddress
          )}
          numbers={precheckRows}
          warning={reviewWarning}
          cutoffIssue={cutoffIssue}
          onToggleWarning={() => setReviewWarning((value) => !value)}
          onToggleCutoffIssue={() => setCutoffIssue((value) => !value)}
          onFixCutoff={() => setCutoffIssue(false)}
          onPacRecovery={() => setExternalDestination("assign-pac")}
          onBackToPrecheck={() => setScreen("number-precheck-result")}
          onSubmit={submitRequest}
        />
      )
    }

    return (
      <SuccessStep
        partialSuccess={partialSuccess}
        onToggleFallback={() => setPartialSuccess((value) => !value)}
        onViewHistory={() => setExternalDestination("external-port-history-entry")}
      />
    )
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex min-w-0 items-center gap-2 px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Phone />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Port operations</div>
              <div className="truncate text-xs text-sidebar-foreground/70">
                UK Mobile-eSIM
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Flow screens</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {screens.map((item, index) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={screen === item.id && !externalDestination}
                      onClick={() => {
                        setExternalDestination(null)
                        setScreen(item.id)
                      }}
                    >
                      <span>{index + 1}</span>
                      <span>{item.shortTitle}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Recovery coverage</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-2 px-3 py-2 text-xs text-sidebar-foreground/70">
                <div className="flex items-center gap-2">
                  <WarningCircle />
                  <span>No verified address</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle />
                  <span>Row-level validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockCounterClockwise />
                  <span>Carrier fallback ticket</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-3 py-2 text-xs text-sidebar-foreground/70">
            Manual support ticket not required
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex min-h-16 flex-col gap-3 border-b px-4 py-3 md:px-6">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="min-h-6" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>Port history</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>Port number</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{activeScreen.shortTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ScenarioToggle value={scenario} onChange={resetFlow} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-medium">
                  Submit UK Mobile-eSIM port request
                </h1>
                <p className="text-sm text-muted-foreground">
                  Submit a UK Mobile-eSIM port request without a manual support ticket.
                </p>
              </div>
              <Badge variant="outline">{activeScreen.title}</Badge>
            </div>
            <StepProgress currentIndex={currentStepIndex} onJump={setScreen} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-5 p-4 md:p-6">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function ScenarioToggle({
  value,
  onChange,
}: {
  value: ScenarioKey
  onChange: (value: ScenarioKey) => void
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Scenario</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onChange(nextValue as ScenarioKey)
          }
        }}
        variant="outline"
        size="sm"
        className="flex-wrap justify-start"
      >
        {scenarioLabels.map((item) => (
          <ToggleGroupItem key={item.key} value={item.key}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

function StepProgress({
  currentIndex,
  onJump,
}: {
  currentIndex: number
  onJump: (screen: ScreenId) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Progress value={((currentIndex + 1) / screens.length) * 100} />
      <div className="grid gap-2 sm:grid-cols-5">
        {screens.map((item, index) => {
          const isActive = index === currentIndex
          const isComplete = index < currentIndex

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onJump(item.id)}
              className={cn(
                "flex min-h-10 min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-start text-sm transition-colors",
                isActive && "border-primary bg-muted",
                isComplete && "bg-muted/50"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                {isComplete ? <CheckCircle /> : index + 1}
              </span>
              <span className="truncate">{item.shortTitle}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AddressStep({
  selectedAddress,
  validationVisible,
  blocked,
  onSelect,
  onContinue,
  onExternalExit,
}: {
  selectedAddress: string
  validationVisible: boolean
  blocked: boolean
  onSelect: (addressId: string) => void
  onContinue: () => void
  onExternalExit: () => void
}) {
  const [showLoading, setShowLoading] = useState(false)

  if (blocked) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Empty className="min-h-[24rem]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseLine />
            </EmptyMedia>
            <EmptyTitle>No verified business address</EmptyTitle>
            <EmptyDescription>
              No verified business address is available for this country.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="text-sm text-muted-foreground">
              Resume saved draft from Port history after verification.
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={onExternalExit}>
                <AddressBook data-icon="inline-start" />
                Go to Business Address & Documents
              </Button>
              <Button variant="outline">
                <FloppyDisk data-icon="inline-start" />
                Save draft
              </Button>
            </div>
          </EmptyContent>
        </Empty>
        <GuidanceCard
          title="Blocked state"
          description="Address creation and KYC stay outside this porting flow."
          items={[
            "Missing address is an external prerequisite exit.",
            "The draft return path is Port history after verification.",
            "Continue is blocked until a verified address exists.",
          ]}
        />
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>Verified business address</CardTitle>
          <CardDescription>
            Select an existing verified UK address before collecting port-in details.
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoading((value) => !value)}
            >
              {showLoading ? "Show addresses" : "Show loading"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {validationVisible && !selectedAddress ? (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Select a verified address to continue.</AlertTitle>
              <AlertDescription>
                Select a row or use the external exit if the prerequisite is missing.
              </AlertDescription>
            </Alert>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-64" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" disabled>
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                verifiedAddresses.map((address) => {
                const isSelected = selectedAddress === address.id

                return (
                  <TableRow key={address.id} data-state={isSelected ? "selected" : undefined}>
                    <TableCell className="min-w-64 whitespace-normal font-medium">
                      {address.address}
                    </TableCell>
                    <TableCell>{address.country}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{address.status}</Badge>
                    </TableCell>
                    <TableCell>{address.updated}</TableCell>
                    <TableCell>
                      <Button
                        variant={isSelected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onSelect(address.id)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <Button variant="outline" onClick={onExternalExit}>
            <AddressBook data-icon="inline-start" />
            Business Address & Documents
          </Button>
          <Button onClick={onContinue} disabled={showLoading}>
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
      <GuidanceCard
        title="Address prerequisite"
        description="Confirm the required address prerequisite."
        items={[
          "Only verified existing addresses can be selected.",
          "Address creation is handled in Business Address & Documents.",
          "Failure behavior stays on this screen with inline validation.",
        ]}
      />
    </div>
  )
}

function NumbersStep({
  value,
  rows,
  validationVisible,
  onChange,
  onFix,
  onContinue,
}: {
  value: string
  rows: ParsedRow[]
  validationVisible: boolean
  onChange: (value: string) => void
  onFix: () => void
  onContinue: () => void
}) {
  const hasErrors = rows.some((row) => row.status === "error")

  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Port-in numbers</CardTitle>
          <CardDescription>Paste one number per line or a separated list.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={validationVisible && (!rows.length || hasErrors)}>
              <FieldLabel htmlFor="port-numbers">Bulk input</FieldLabel>
              <InputGroup className="min-h-48 items-stretch">
                <InputGroupTextarea
                  id="port-numbers"
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  aria-invalid={validationVisible && (!rows.length || hasErrors)}
                  placeholder="+447700900101"
                  className="min-h-48"
                />
              </InputGroup>
              <FieldDescription>
                Accepted input: one UK mobile number per line or pasted list.
              </FieldDescription>
              {validationVisible && !rows.length ? (
                <FieldError>Enter at least one parseable number.</FieldError>
              ) : null}
              {validationVisible && hasErrors ? (
                <FieldError>Some numbers need correction before pre-check.</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <Button variant="outline" onClick={onFix}>
            <ClipboardText data-icon="inline-start" />
            Load valid sample
          </Button>
          <Button onClick={onContinue}>
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Parsed preview</CardTitle>
          <CardDescription>
            Row-level format and duplicate checks remain visible before pre-check.
          </CardDescription>
          <CardAction>
            <Badge variant={hasErrors ? "destructive" : "secondary"}>
              {hasErrors ? "Error" : `${rows.length} ready`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {validationVisible && hasErrors ? (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Row-level validation error</AlertTitle>
              <AlertDescription>
                Edit or remove failed rows before continuing.
              </AlertDescription>
            </Alert>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Duplicate</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.number}</TableCell>
                    <TableCell>{row.format}</TableCell>
                    <TableCell>{row.duplicate}</TableCell>
                    <TableCell className="min-w-48 whitespace-normal">
                      {row.eligibility}
                      {row.issue ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {row.issue}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status === "ready" ? "pass" : "fail"} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No parsed numbers yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function PrecheckStep({
  rows,
  onFix,
  onRemove,
  onContinue,
}: {
  rows: PrecheckRow[]
  onFix: (rowId: string) => void
  onRemove: (rowId: string) => void
  onContinue: () => void
}) {
  const [showLoading, setShowLoading] = useState(false)
  const hasErrors = rows.some((row) => row.status === "fail")

  return (
    <div className="flex flex-col gap-5">
      {hasErrors ? (
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>Some numbers failed eligibility or duplicate checks.</AlertTitle>
          <AlertDescription>
            Edit or remove affected rows before continuing to review.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle />
          <AlertTitle>All blocking pre-check issues are resolved.</AlertTitle>
          <AlertDescription>
            Detected carrier and eligibility results are ready for review.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Grouped pre-check results</CardTitle>
          <CardDescription>
            Automated donor carrier detection and business-mobile eligibility.
          </CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={hasErrors ? "destructive" : "secondary"}>
                {showLoading ? "Loading" : hasErrors ? "Partial error" : "Ready"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoading((value) => !value)}
              >
                {showLoading ? "Show results" : "Show loading"}
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Detected carrier</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-64" />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" disabled>
                        Waiting
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.number}</TableCell>
                  <TableCell>{row.carrier}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="min-w-64 whitespace-normal">{row.issue}</TableCell>
                  <TableCell>
                    {row.status === "fail" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => onFix(row.id)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onRemove(row.id)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        No action
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button onClick={onContinue} disabled={showLoading || hasErrors || !rows.length}>
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function ReviewStep({
  selectedAddress,
  numbers,
  warning,
  cutoffIssue,
  onToggleWarning,
  onToggleCutoffIssue,
  onFixCutoff,
  onPacRecovery,
  onBackToPrecheck,
  onSubmit,
}: {
  selectedAddress?: (typeof verifiedAddresses)[number]
  numbers: PrecheckRow[]
  warning: boolean
  cutoffIssue: boolean
  onToggleWarning: () => void
  onToggleCutoffIssue: () => void
  onFixCutoff: () => void
  onPacRecovery: () => void
  onBackToPrecheck: () => void
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {warning ? (
        <Alert>
          <WarningCircle />
          <AlertTitle>Some PAC codes are close to expiry.</AlertTitle>
          <AlertDescription>
            Return to PAC assignment to refresh affected coverage before final submit.
          </AlertDescription>
        </Alert>
      ) : null}
      {cutoffIssue ? (
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>Selected date may not meet cutoff.</AlertTitle>
          <AlertDescription>
            Port request must respect the 4:30PM UK cutoff. Choose a later eligible
            date before submitting.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        <SummaryPanel
          title="Carrier"
          rows={[
            ["O2 Business", `${numbers.filter((row) => row.carrier === "O2 Business").length} numbers`],
            [
              "Vodafone Business",
              `${numbers.filter((row) => row.carrier === "Vodafone Business").length} numbers`,
            ],
            ["EE Business", `${numbers.filter((row) => row.carrier === "EE Business").length} numbers`],
          ]}
        />
        <SummaryPanel
          title="PAC mode"
          rows={[
            ["Collection", "Covered by existing prerequisite data"],
            ["Expiry status", warning ? "Close to expiry" : "No immediate expiry risk"],
          ]}
        />
        <SummaryPanel
          title="Port date"
          rows={[
            ["Requested date", "Next eligible UK business day"],
            ["4:30PM cutoff", cutoffIssue ? "Validation blocked" : "Validation passed"],
          ]}
        />
        <SummaryPanel
          title="Subscriber mapping"
          rows={[
            ["Mapped numbers", `${numbers.length} validated rows`],
            ["Business address", selectedAddress?.address ?? "Verified UK address"],
          ]}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Final submission</CardTitle>
          <CardDescription>
            Submit only after blocking validation passes. Edit links return to defined steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onBackToPrecheck}>
            <MagnifyingGlass data-icon="inline-start" />
            Edit pre-check rows
          </Button>
          <Button variant="outline" onClick={onPacRecovery}>
            <ClockCounterClockwise data-icon="inline-start" />
            Return to PAC assignment
          </Button>
          <Button variant="outline" onClick={onToggleWarning}>
            <WarningCircle data-icon="inline-start" />
            {warning ? "Hide warning" : "Show warning"}
          </Button>
          <Button variant="outline" onClick={onToggleCutoffIssue}>
            <XCircle data-icon="inline-start" />
            {cutoffIssue ? "Hide cutoff issue" : "Show cutoff issue"}
          </Button>
          {cutoffIssue ? (
            <Button variant="outline" onClick={onFixCutoff}>
              <CheckCircle data-icon="inline-start" />
              Choose later eligible date
            </Button>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button onClick={onSubmit} disabled={cutoffIssue}>
            Submit
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function SuccessStep({
  partialSuccess,
  onToggleFallback,
  onViewHistory,
}: {
  partialSuccess: boolean
  onToggleFallback: () => void
  onViewHistory: () => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>Request submitted</CardTitle>
          <CardDescription>
            Order ID PR-UK-2026-00418 is ready for Port history tracking.
          </CardDescription>
          <CardAction>
            <Badge variant={partialSuccess ? "outline" : "secondary"}>
              {partialSuccess ? "Partial success" : "Submitted"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {partialSuccess ? (
            <Alert>
              <ClockCounterClockwise />
              <AlertTitle>Carrier API is unavailable for one group.</AlertTitle>
              <AlertDescription>
                A fallback ticket was created and can be tracked in Port history.
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-3">
            {[
              ["Submitted", "Request accepted and confirmation email expected."],
              ["Port scheduled", "Next status will appear in Port history."],
              [
                "Exception",
                partialSuccess
                  ? "Fallback ticket created for the affected carrier group."
                  : "No exception reported.",
              ],
            ].map(([title, description], index) => (
              <div key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    {index === 0 ? <CheckCircle /> : <ClockCounterClockwise />}
                  </div>
                  {index < 2 ? <div className="min-h-8 w-px bg-border" /> : null}
                </div>
                <div className="min-w-0 pb-4">
                  <div className="font-medium">{title}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <Button variant="outline" onClick={onToggleFallback}>
            <ClockCounterClockwise data-icon="inline-start" />
            {partialSuccess ? "Show submitted state" : "Show fallback ticket"}
          </Button>
          <Button onClick={onViewHistory}>
            View in Port history
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
      <GuidanceCard
        title="Status entry"
        description="Submitted requests continue to the Port history tracking entry."
        items={[
          "Order ID and confirmation expectation are visible.",
          "Fallback ticket state is available without building a full dashboard.",
          "View in Port history exits to the external tracking state.",
        ]}
      />
    </div>
  )
}

function ExternalState({
  destination,
  onResume,
}: {
  destination: Exclude<ExternalDestination, null>
  onResume: () => void
}) {
  const content = {
    "external-business-address-documents": {
      title: "Business Address & Documents",
      description:
        "External prerequisite destination reached. Address creation and KYC remain outside the port request submission flow.",
      badge: "Blocked recovery",
    },
    "external-port-history-entry": {
      title: "Port history tracking entry",
      description:
        "External tracking state reached for order PR-UK-2026-00418. Full Port history dashboard is out of scope.",
      badge: "Tracking state",
    },
    "assign-pac": {
      title: "PAC assignment recovery",
      description:
        "Defined recovery destination reached. PAC assignment details remain outside this shortened review path.",
      badge: "Warning recovery",
    },
  }[destination]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
        <CardAction>
          <Badge variant="outline">{content.badge}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info />
          <AlertTitle>External state marker</AlertTitle>
          <AlertDescription>
            This exit is recorded without adding prerequisite workflow screens.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button onClick={onResume}>Resume request</Button>
      </CardFooter>
    </Card>
  )
}

function SummaryPanel({
  title,
  rows,
}: {
  title: string
  rows: Array<[string, string]>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="min-w-0 break-words text-sm font-medium">{value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function GuidanceCard({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item} className="flex min-w-0 gap-2 text-sm">
            <CheckCircle className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words text-muted-foreground">{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: "pass" | "fail" }) {
  if (status === "fail") {
    return <Badge variant="destructive">Error</Badge>
  }

  return <Badge variant="secondary">Pass</Badge>
}

export default App
