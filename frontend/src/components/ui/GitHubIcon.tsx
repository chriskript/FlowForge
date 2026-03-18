import type { SVGProps } from 'react'
import { siGithub } from 'simple-icons'

type GitHubIconProps = SVGProps<SVGSVGElement> & {
  size?: number
  iconTitle?: string
}

export function GitHubIcon({ size = 16, iconTitle = 'GitHub', ...props }: GitHubIconProps) {
  return (
    <svg
      role="img"
      aria-label={iconTitle}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      {...props}
    >
      {iconTitle ? <title>{iconTitle}</title> : null}
      <path d={siGithub.path} />
    </svg>
  )
}