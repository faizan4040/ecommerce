import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Star } from 'lucide-react'

dayjs.extend(relativeTime)

const COLORS = ['bg-orange-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500']

const Reviewlist = ({ review }) => {
  const name = review?.reviewedBy || 'Customer'
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const color = COLORS[name.length % COLORS.length]

  return (
    <article className="flex h-full flex-col rounded-3xl border bg-white p-5 transition hover:shadow-lg hover:shadow-neutral-200/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {review?.avatar?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={review.avatar.url} alt={name} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}>{initials}</span>
          )}
          <div>
            <p className="font-semibold leading-tight">{name}</p>
            <p className="text-xs text-neutral-400">{dayjs(review?.createdAt).fromNow()}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {review?.rating}
        </span>
      </div>

      <div className="mt-3 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`h-4 w-4 ${s <= review?.rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}`} />
        ))}
      </div>

      {review?.title && <h4 className="mt-2 font-bold text-neutral-900">{review.title}</h4>}
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{review?.review}</p>
    </article>
  )
}

export default Reviewlist
