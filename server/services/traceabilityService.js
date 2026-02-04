import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Get complete token ancestry using recursive database function
 * Returns all ancestor tokens with generation depth
 */
export const getTokenAncestry = async (tokenId) => {
    try {
        const { data, error } = await supabase.rpc('calculate_token_ancestry', {
            token_uuid: tokenId
        })

        if (error) {
            console.error('Ancestry calculation error:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Get token ancestry error:', error)
        return null
    }
}

/**
 * Calculate mine source percentages for a token
 * Traces back to original gold batches and calculates contribution percentages
 */
export const calculateSourcePercentages = async (tokenId) => {
    try {
        // Get token's complete ancestry
        const ancestry = await getTokenAncestry(tokenId)

        if (!ancestry || ancestry.length === 0) {
            return []
        }

        // Get unique batch IDs from ancestry
        const batchIds = [...new Set(ancestry.map(a => a.ancestor_batch_id))]

        // Fetch batch details
        const { data: batches, error } = await supabase
            .from('gold_batches')
            .select('id, batch_id, source, weight')
            .in('id', batchIds)

        if (error || !batches) {
            console.error('Batch fetch error:', error)
            return []
        }

        // Calculate weight contribution from each batch
        const batchContributions = {}
        let totalWeight = 0

        for (const ancestorRecord of ancestry) {
            if (ancestorRecord.generation === 0) continue // Skip the token itself in percentage calc

            const batchId = ancestorRecord.ancestor_batch_id
            const weight = parseFloat(ancestorRecord.weight_contribution)

            if (!batchContributions[batchId]) {
                batchContributions[batchId] = 0
            }
            batchContributions[batchId] += weight
            totalWeight += weight
        }

        // Convert to percentage
        const sourcePercentages = []
        for (const batch of batches) {
            const contribution = batchContributions[batch.id] || 0
            const percentage = totalWeight > 0 ? (contribution / totalWeight) * 100 : 0

            sourcePercentages.push({
                batch_id: batch.batch_id,
                source: batch.source,
                weight_contribution: contribution.toFixed(2),
                percentage: percentage.toFixed(2)
            })
        }

        return sourcePercentages.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))

    } catch (error) {
        console.error('Calculate source percentages error:', error)
        return []
    }
}

/**
 * Get original mine origins for a token
 * Returns list of unique mine sources
 */
export const getMineOrigins = async (tokenId) => {
    try {
        const sourcePercentages = await calculateSourcePercentages(tokenId)
        return sourcePercentages.map(s => ({
            name: s.source,
            batch_id: s.batch_id,
            percentage: parseFloat(s.percentage)
        }))
    } catch (error) {
        console.error('Get mine origins error:', error)
        return []
    }
}

/**
 * Build complete lineage tree for visualization
 * Returns hierarchical structure of token relationships
 */
export const buildLineageTree = async (tokenId) => {
    try {
        // Get token lineage records
        const { data: lineageRecords, error } = await supabase
            .from('token_lineage')
            .select(`
                *,
                parent:tokens!parent_token_id(id, token_id, weight, purity, status),
                child:tokens!child_token_id(id, token_id, weight, purity, status)
            `)
            .eq('child_token_id', tokenId)

        if (error) {
            console.error('Lineage fetch error:', error)
            return null
        }

        // Recursively build tree
        const buildNode = async (currentTokenId) => {
            const { data: token } = await supabase
                .from('tokens')
                .select('*')
                .eq('id', currentTokenId)
                .single()

            if (!token) return null

            const { data: parents } = await supabase
                .from('token_lineage')
                .select('parent_token_id, operation_type, weight_transferred')
                .eq('child_token_id', currentTokenId)

            const node = {
                token_id: token.token_id,
                weight: token.weight,
                purity: token.purity,
                status: token.status,
                parents: []
            }

            if (parents && parents.length > 0) {
                for (const parent of parents) {
                    const parentNode = await buildNode(parent.parent_token_id)
                    if (parentNode) {
                        node.parents.push({
                            ...parentNode,
                            operation: parent.operation_type,
                            weight_transferred: parent.weight_transferred
                        })
                    }
                }
            }

            return node
        }

        return await buildNode(tokenId)

    } catch (error) {
        console.error('Build lineage tree error:', error)
        return null
    }
}

/**
 * Calculate lineage statistics
 */
export const getLineageStats = (lineageTree) => {
    let maxDepth = 0
    let totalTransformations = 0

    const traverse = (node, depth = 0) => {
        maxDepth = Math.max(maxDepth, depth)

        if (node.parents && node.parents.length > 0) {
            totalTransformations += node.parents.length
            for (const parent of node.parents) {
                traverse(parent, depth + 1)
            }
        }
    }

    if (lineageTree) {
        traverse(lineageTree)
    }

    return {
        deepest_generation: maxDepth,
        total_transformations: totalTransformations
    }
}
