interface Option {
  key: string
  label: string
  icon?: string
}

interface Props {
  options: readonly Option[]
  selected: string[]
  onChange: (keys: string[]) => void
  title: string
}

export default function SymptomTags({ options, selected, onChange, title }: Props) {
  const toggle = (key: string) => {
    if (selected.includes(key)) onChange(selected.filter(k => k !== key))
    else onChange([...selected, key])
  }

  return (
    <div>
      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const isActive = selected.includes(opt.key)
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors duration-200
                ${isActive
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200/80 active:scale-95'}`}
            >
              {opt.icon && <span className="mr-0.5 text-[10px]">{opt.icon}</span>}
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
