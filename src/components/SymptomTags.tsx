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
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${selected.includes(opt.key)
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {opt.icon && <span className="mr-1">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
