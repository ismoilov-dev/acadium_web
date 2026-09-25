import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPhone } from '@/lib/phone'
import { fullName, initials } from '@/lib/roles'

export function PersonCell({
  person,
  sub,
}: {
  person: { first_name?: string; last_name?: string; phone?: string; avatar_url?: string }
  sub?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9">
        {person.avatar_url && <AvatarImage src={person.avatar_url} alt="" />}
        <AvatarFallback>{initials(person)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-bold">{fullName(person)}</p>
        <p className="tabular truncate text-xs font-medium text-ink-mute">
          {sub ?? formatPhone(person.phone)}
        </p>
      </div>
    </div>
  )
}
