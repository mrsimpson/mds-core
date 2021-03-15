import { MicromobilityPolicy, UUID, PolicyMetadata, PolicyTypeInfo } from '@mds-core/mds-types'
import {
  ApiRequest,
  ApiVersionedResponse,
  ApiRequestParams,
  ApiRequestQuery,
  ApiResponseLocalsClaims
} from '@mds-core/mds-api-server'

export const MICROMOBILITY_POLICY_AUTHOR_API_SUPPORTED_VERSIONS = ['0.4.1'] as const
export type MICROMOBILITY_POLICY_AUTHOR_API_SUPPORTED_VERSION = typeof MICROMOBILITY_POLICY_AUTHOR_API_SUPPORTED_VERSIONS[number]
export const [POLICY_AUTHOR_API_DEFAULT_VERSION] = MICROMOBILITY_POLICY_AUTHOR_API_SUPPORTED_VERSIONS

export type PolicyAuthorApiRequest<B = {}> = ApiRequest<B>

export type PolicyAuthorApiPostPolicyRequest<PInfo extends PolicyTypeInfo> = PolicyAuthorApiRequest<PInfo['Policy']>
export type PolicyAuthorApiPublishPolicyRequest = PolicyAuthorApiRequest & ApiRequestParams<'policy_id'>
export type PolicyAuthorApiEditPolicyRequest = PolicyAuthorApiRequest<MicromobilityPolicy>
export type PolicyAuthorApiDeletePolicyRequest = PolicyAuthorApiRequest & ApiRequestParams<'policy_id'>
export type PolicyAuthorApiGetPolicyMetadataRequest = PolicyAuthorApiRequest &
  ApiRequestQuery<'get_published' | 'get_unpublished'>
export type PolicyAuthorApiGetPolicyMetadatumRequest = PolicyAuthorApiRequest & ApiRequestParams<'policy_id'>
export type PolicyAuthorApiEditPolicyMetadataRequest = PolicyAuthorApiRequest<PolicyMetadata>

export type PolicyAuthorApiAccessTokenScopes =
  | 'policies:read'
  | 'policies:write'
  | 'policies:publish'
  | 'policies:delete'

type PolicyAuthorApiResponse<B = {}> = ApiVersionedResponse<POLICY_AUTHOR_API_SUPPORTED_VERSION, B> &
  ApiResponseLocalsClaims<PolicyAuthorApiAccessTokenScopes>

export type PolicyAuthorApiGetPoliciesResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policies: PInfo['Policy'][] }
}>
export type PolicyAuthorApiGetPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiPostPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiPublishPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiEditPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiDeletePolicyResponse = PolicyAuthorApiResponse<{
  data: { policy_id: UUID }
}>

export type PolicyAuthorApiGetPolicyMetadatumResponse = PolicyAuthorApiResponse<{
  data: { policy_metadata: PolicyMetadata }
}>
export type PolicyAuthorApiGetPolicyMetadataResponse = PolicyAuthorApiResponse<{
  data: { policy_metadata: PolicyMetadata[] }
}>
export type PolicyAuthorApiEditPolicyMetadataResponse = PolicyAuthorApiResponse<{
  data: { policy_metadata: PolicyMetadata }
}>
