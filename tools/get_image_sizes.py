import os
import json
from PIL import Image

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# list of required images from user's map
filenames = [
    'ai-coding-agents-featured.png',
    'autocomplete-to-coding-agents.png',
    'human-agent-responsibilities.png',
    'when-to-delegate-ai-coding-tasks.png',
    'ai-code-verification-loop.png',

    'ai-infrastructure-boom-featured.png',
    'ai-infrastructure-stack.png',
    'why-ai-costs-more-to-scale.png',
    'power-is-the-bottleneck.png',
    'where-engineers-fit.png',
    'ai-investment-cycle.png',

    'aws-vs-azure-vs-google-cloud-featured.png',
    'global-cloud-market-share-q2-2026.png',
    'cloud-provider-strengths.png',
    'cloud-service-equivalents.png',
    'cloud-provider-decision-tree.png',
    'cloud-skills-that-transfer.png',

    'ai-assisted-ci-cd-featured.png',
    'where-ai-assists-ci-cd.png',
    'ai-human-code-review-gate.png',
    'ai-generated-test-review-loop.png',
    'progressive-delivery-safety-gates.png',
    'ci-cd-learning-feedback-loop.png',

    'finops-101-featured.png',
    'shared-cloud-value-ownership.png',
    'cloud-cost-allocation-flow.png',
    'cloud-capacity-models.png',
    'cloud-unit-economics.png',
    'finops-operating-loop.png',

    'serverless-vs-containers-featured.png',
    'operational-responsibility-comparison.png',
    'workload-pattern-selector.png',
    'serverless-container-total-cost.png',
    'runtime-architecture-constraints.png',
    'hybrid-serverless-container-architecture.png',

    'platform-engineering-featured.png',
    'why-platforms-emerged.png',
    'internal-developer-platform-workflow.png',
    'devops-platform-engineering-relationship.png',
    'golden-paths-escape-hatches.png',

    'nuclear-powered-data-centers-featured.png',
    'data-center-electricity-demand.png',
    'data-center-grid-bottleneck.png',
    'data-center-energy-mix.png',
    'big-tech-nuclear-agreements.png',
    'data-center-capacity-planning-cycle.png',

    'gaming-console-prices-featured.png',
    'console-vs-ai-memory.png',
    'console-supply-chain.png',
    'console-retail-price-factors.png',
    'ai-demand-gaming-hardware-flow.png',
    'verify-console-price-increase.png',

    # consolidation article alternatives
    'cloud-consolidation.png',
    'how-we-got-here.png',
    'what-concentration-means.png',
    'vendor-lock-in.png',
    'may-increase-concentration.png',
    'the-practical-response.png',
    'cloud-consolidation-featured.png',
    'how-cloud-concentration-formed.png',
    'concentration-tradeoffs.png',
    'vendor-lock-in-path.png',
    'ai-cloud-scale-feedback-loop.png',
    'cloud-dependency-decision-framework.png',
]

results = {}
for name in filenames:
    found = None
    for dirpath, dirnames, files in os.walk(root):
        for f in files:
            if f == name:
                found = os.path.join(dirpath, f)
                break
        if found:
            break
    if not found:
        results[name] = None
    else:
        try:
            with Image.open(found) as img:
                results[name] = {
                    'path': os.path.relpath(found, root).replace('\\', '/'),
                    'width': img.width,
                    'height': img.height,
                    'mode': img.mode,
                }
        except Exception as e:
            results[name] = {'path': os.path.relpath(found, root).replace('\\', '/'), 'error': str(e)}

print(json.dumps(results, indent=2))
