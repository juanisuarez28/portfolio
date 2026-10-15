import { useState } from 'react'
import { certificates, degrees } from '../content/education'
import { profile } from '../content/profile'
import { skillGroups, softSkills } from '../content/skills'
import type { SectionId } from '../content/types'
import { BallIcon, CodeIcon, CopyIcon, DownloadIcon, ExternalIcon, FileIcon, GithubIcon, LinkedinIcon, MailIcon, PinIcon } from './icons'
import { ContactChat } from './ContactChat'
import { ProjectsBrowser } from './ProjectsBrowser'

export function About() {
  return (
    <div className="section-about">
      <div className="about-head">
        <img src={profile.photo} alt={`Foto de ${profile.name}`} className="avatar" />
        <div>
          <p className="eyebrow">¡Hola! Soy</p>
          <h3 className="about-name">{profile.name}</h3>
          <p className="accent">{profile.role}</p>
          <p className="muted with-icon">
            <PinIcon width={15} height={15} /> {profile.location}
          </p>
        </div>
      </div>
      <p>{profile.intro}</p>
      <p>{profile.studies}</p>
      <h4>Desde chico tengo dos grandes pasiones</h4>
      <div className="passions">
        {profile.passions.map((p) => (
          <div key={p.id} className="passion">
            <span className="passion-icon">{p.id === 'tech' ? <CodeIcon /> : <BallIcon />}</span>
            <div>
              <strong>{p.title}</strong>
              <p>{p.text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="balance">{profile.balance} 🔋</p>
      <h4>Cómo trabajo</h4>
      <p>{profile.softSkillsIntro}</p>
    </div>
  )
}

export function Education() {
  return (
    <div>
      <h4>Carreras universitarias</h4>
      <div className="degrees">
        {degrees.map((d) => (
          <div key={d.id} className="degree">
            <span className="degree-badge">{d.shortTitle}</span>
            <div>
              <strong>{d.title}</strong>
              <p className="muted">{d.institution}</p>
            </div>
          </div>
        ))}
      </div>
      <h4>Certificados extra-universitarios</h4>
      <div className="cert-list">
        {certificates.map((c) => (
          <article key={c.id} className="cert">
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="cert-img">
              <img src={c.image} alt={c.title} loading="lazy" />
            </a>
            <div>
              <strong>{c.title}</strong>
              <p>{c.description}</p>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <ExternalIcon /> Ver certificado
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function Skills() {
  return (
    <div>
      <div className="skill-groups">
        {skillGroups.map((g) => (
          <div key={g.id} className="skill-group" style={{ '--note': g.color } as React.CSSProperties}>
            <h4>{g.title}</h4>
            <ul className="tags">
              {g.skills.map((s) => (
                <li key={s} className="tag">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <h4>Soft skills</h4>
      <ul className="tags tags-soft">
        {softSkills.map((s) => (
          <li key={s} className="tag">
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* sin permisos de portapapeles: el mailto sigue disponible */
    }
  }
  return (
    <div>
      <p className="lead">¿Tenés un proyecto en mente o una propuesta laboral? Escribime y lo charlamos.</p>
      <div className="contact-mail">
        <a href={`mailto:${profile.email}`} className="btn btn-primary">
          <MailIcon /> Enviar un mail
        </a>
        <button className="btn btn-ghost" onClick={copy}>
          <CopyIcon /> {copied ? '¡Copiado!' : 'Copiar mail'}
        </button>
      </div>
      <p className="muted mono">{profile.email}</p>
      <div className="contact-links">
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
          <LinkedinIcon width={22} height={22} />
          <span>
            <strong>LinkedIn</strong>
            <small>juan-ignacio-suarez-</small>
          </span>
        </a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="contact-link">
          <GithubIcon width={22} height={22} />
          <span>
            <strong>GitHub</strong>
            <small>juanisuarez28</small>
          </span>
        </a>
        <a href={profile.cv} download={profile.cvFileName} className="contact-link">
          <DownloadIcon width={22} height={22} />
          <span>
            <strong>Currículum</strong>
            <small>Descargar PDF</small>
          </span>
        </a>
      </div>
    </div>
  )
}

export function Cv() {
  return (
    <div>
      <div className="cv-card">
        <FileIcon width={42} height={42} />
        <div>
          <strong>{profile.cvFileName}</strong>
          <p className="muted">
            {profile.name} · {profile.role}
          </p>
        </div>
      </div>
      <div className="contact-mail">
        <a href={profile.cv} download={profile.cvFileName} className="btn btn-primary">
          <DownloadIcon /> Descargar CV
        </a>
        <a href={profile.cv} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          <ExternalIcon /> Abrir en otra pestaña
        </a>
      </div>
    </div>
  )
}

export const sectionContent: Record<SectionId, () => React.JSX.Element> = {
  about: About,
  projects: () => <ProjectsBrowser variant="panel" />,
  education: Education,
  skills: Skills,
  contact: () => <ContactChat variant="panel" />,
  cv: Cv,
}
