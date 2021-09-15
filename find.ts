const prules = {}
policies2.forEach(policy => {
  const old_policy = policy[0]
  if (old_policy.rules) {
    old_policy.rules.forEach(rule => {
      Object.keys(rule.states).forEach(stateKey => {
        if (rule.states[stateKey].length > 0) {
          if (!prules[old_policy.policy_id]) {
            prules[old_policy.policy_id] = []
          }
          prules[old_policy.policy_id].push(rule.rule_id)
        }
      })
    })
  }
})
