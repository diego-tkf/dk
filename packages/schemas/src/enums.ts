import { z } from 'zod'

export const CampaignTypeSchema = z.enum(['weekly-carousel', 'newsletter', 'ad-variant'])
export type CampaignType = z.infer<typeof CampaignTypeSchema>

export const CampaignStatusSchema = z.enum(['draft', 'in_progress', 'in_review', 'approved', 'published', 'archived'])
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>

export const DeliverableStatusSchema = z.enum([
	'pending_generation',
	'variants_ready',
	'approved',
	'exported',
	'rejected',
])
export type DeliverableStatus = z.infer<typeof DeliverableStatusSchema>

export const ComplianceStatusSchema = z.enum(['pending', 'passed', 'flagged', 'overridden', 'rejected'])
export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>

export const ImageGeneratorSchema = z.enum(['gpt-image-1', 'flux-1.1-pro'])
export type ImageGenerator = z.infer<typeof ImageGeneratorSchema>

export const ConstraintCheckSchema = z.enum(['vision_model', 'text_classifier', 'text_presence'])
export type ConstraintCheck = z.infer<typeof ConstraintCheckSchema>

export const ConstraintSeveritySchema = z.enum(['blocking', 'warning', 'info'])
export type ConstraintSeverity = z.infer<typeof ConstraintSeveritySchema>

export const ProfileStatusSchema = z.enum(['draft', 'in_review', 'approved', 'deprecated'])
export type ProfileStatus = z.infer<typeof ProfileStatusSchema>

export const ActorTypeSchema = z.enum(['user', 'agent', 'system'])
export type ActorType = z.infer<typeof ActorTypeSchema>

export const RoleNameSchema = z.enum(['designer', 'compliance_reviewer', 'profile_approver', 'admin', 'viewer'])
export type RoleName = z.infer<typeof RoleNameSchema>
