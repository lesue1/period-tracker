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
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isActive = selected.includes(opt.key)
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200/80 active:scale-95'}`}
            >
              {opt.icon && <span className="mr-1">{opt.icon}</span>}
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
