# mds-compliance

MDS Compliance

## Build Instructions

After installing all requisite packages (see [MDS-JS/README](https://github.com/ellis-assoc/mds-js/blob/master/README.md)), simply navigate into the root `mds-compliance` directory, and run `yarn build`.


## Notes on business logic

A `Policy` can contain only one kind of rule. E.g. a policy can only have count rules, or only speed rules, but not a mixture of the two.

Order matters for rule evaluation. A vehicle that matches the first rule will not match for subsequent rules.

### Special notes for count rules

If a provider (or group of providers) goes over some count rule's maximum, all the vehicles are collectively responsible for the rule violation. Even though the vehicles that most recently entered the rule's geography pushed the provider(s) into violation, the violation wouldn't have happened had there not been already vehicles in the geography.

If a provider (or group of providers) goes under some count rule's minimum, while a violation has occurred, technically none of the vehicles present contributed to the violation. The "absent" vehicles are why the violation happened. That is, while a provider (or providers) may be in violation, it is impossible to assign any blame to any of the vehicles that were actually present.