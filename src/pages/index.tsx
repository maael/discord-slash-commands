import commands from '../commands'

export default function Index({ commands }: any) {
  return (
    <div className="max-w-xl mx-auto my-2">
      <div className="text-center my-5">
        <a
          className="text-4xl font-bold text-purple-400"
          href="https://discord.com/oauth2/authorize?client_id=850402324421279774&permissions=328565517376&scope=bot applications.commands messages.read"
        >
          Invite this bot ➡
        </a>
      </div>
      <div className="text-xl font-bold my-2">Commands</div>
      <div className="flex flex-col gap-5">
        {Object.entries<any>(commands).map(([id, info]) => (
          <div key={id} className="flex flex-row gap-5">
            <div className="bg-purple-700 text-white px-3 py-1 rounded-md table">/{id}</div>
            {info.options ? (
              <div className="bg-purple-700 bg-opacity-50 text-white px-3 py-1 rounded-md table">{info.options}</div>
            ) : null}
            <div className="py-1">{info.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function getStaticProps() {
  return {
    props: {
      commands: Object.fromEntries(
        Object.entries(commands).map(([k, v]) => [k, { options: v.options || null, description: v.description }])
      ),
    },
  }
}
