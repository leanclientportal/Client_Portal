'use client'

import * as React from "react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { generalSettings } from "@/lib/utils"

import { cn } from "@/lib/utils"
import { Input } from "./input"

type DatePickerProps = {
  selected?: Date | null
  onChange: (date: Date | null) => void
  className?: string
  placeholderText?: string
  disabled?: boolean | false
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <ReactDatePicker
        showIcon
        wrapperClassName="datepicker-wrapper"
        dateFormat={generalSettings.dateFormat}
        customInput={<Input ref={ref} />}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          className
        )}
        {...props}
      />
    )
  }
)

DatePicker.displayName = "DatePicker"

export { DatePicker }
