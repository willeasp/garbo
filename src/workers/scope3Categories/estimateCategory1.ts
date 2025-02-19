import { DiscordJob, DiscordWorker } from '../../lib/DiscordWorker'
import { vectorDB } from '../../lib/vectordb'
import { askStream } from '../../lib/openai'
import { zodResponseFormat } from 'openai/helpers/zod'

export class EstimateCategory1Job extends DiscordJob {
  declare data: DiscordJob['data'] & {
    companyName: string
    industry: string
    scope12Data: any
    scope3Data: any
    turnover: any
  }
}

const estimateCategory1 = new DiscordWorker<EstimateCategory1Job>(
  'estimateCategory1',
  async (job) => {
    const { url, companyName, industry, scope12Data, scope3Data, turnover } = job.data

    const {
      default: { schema, prompt, queryTexts },
    } = await import('../../prompts/scope3Categories/category1')

    // Get relevant context about procurement and supply chain
    const markdown = await vectorDB.getRelevantMarkdown(url, queryTexts, 5)

    const contextData = {
      industry,
      scope12Data,
      scope3Data,
      turnover,
      extractedText: markdown
    }

    const response = await askStream(
      [
        {
          role: 'system',
          content: 'You are an expert in Scope 3 Category 1 emissions calculation and supply chain analysis.'
        },
        {
          role: 'user',
          content: `Analyze Category 1 (Purchased Goods and Services) emissions for ${companyName}:\n${JSON.stringify(contextData, null, 2)}\n\n${prompt}`
        }
      ],
      {
        response_format: zodResponseFormat(schema, 'scope3-category1')
      }
    )

    const analysis = JSON.parse(response)

    await job.sendMessage(`
📊 Scope 3 Category 1 Analysis for ${companyName}:

Estimated emissions: ${analysis.analysis.estimatedEmissions.value} ${analysis.analysis.estimatedEmissions.unit}
Confidence: ${Math.round(analysis.analysis.estimatedEmissions.confidence * 100)}%

Reasoning: ${analysis.analysis.reasoning}

Methodology: ${analysis.analysis.methodology}

Key factors:
${analysis.analysis.relevantFactors.map(f => `- ${f.name} (${f.impact} impact): ${f.value}`).join('\n')}

Data gaps:
${analysis.analysis.dataGaps.map(gap => `- ${gap}`).join('\n')}

Recommendations:
${analysis.analysis.recommendations.map(rec => `- ${rec}`).join('\n')}
`)

    return analysis
  }
)

export default estimateCategory1
