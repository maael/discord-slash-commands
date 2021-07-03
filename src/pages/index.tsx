import commands from '../commands'

export default function Index() {
  return (
    <div className="max-w-xl mx-auto my-2">
      <div className="text-lg font-bold">Commands</div>
      <div className="flex gap-5">
        {Object.entries(commands).map(([id, info]) => (
          <div key={id} className="flex flex-row gap-5">
            <div>/{id}</div>
            <div>{info.options}</div>
            <div>{info.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
