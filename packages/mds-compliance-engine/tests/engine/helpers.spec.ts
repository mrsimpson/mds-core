import type { Rule } from '@mds-core/mds-policy-service'
import type { VehicleEvent } from '@mds-core/mds-types'
import { Settings } from 'luxon'
import { isInStatesOrEvents, isRuleActive } from '../../engine/helpers'

describe('Tests isRuleActive checking', () => {
  const oldTimezone = process.env.TIMEZONE
  beforeAll(() => {
    process.env.TIMEZONE = 'UTC'
  })

  afterAll(() => {
    process.env.TIMEZONE = oldTimezone // make sure to reset TIMEZONE to whatever it was before
    Settings.now = () => new Date().valueOf() // make sure to reset luxon
  })

  describe('Null everything', () => {
    it('Tests for rule with no start_time, end_time, or days to be true', () => {
      expect(
        isRuleActive({
          days: null,
          start_time: null,
          end_time: null
        })
      ).toStrictEqual(true)
    })
  })

  describe('Test only days', () => {
    it('Tests for rule with only days and no start_time/end_time to be true if day aligns', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf() // this is a wednesday

      expect(
        isRuleActive({
          days: ['wed'],
          start_time: null,
          end_time: null
        })
      ).toStrictEqual(true)
    })

    it('Tests for rule with only days and no start_time/end_time to be false if day does not align', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf() // this is a wednesday

      expect(
        isRuleActive({
          days: ['mon'],
          start_time: null,
          end_time: null
        })
      ).toStrictEqual(false)
    })
  })

  describe('Tests only start_time && end_time', () => {
    it('Tests start_time/end_time to be true if current time aligns', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: null,
          start_time: '02:00:00',
          end_time: '10:00:00'
        })
      ).toStrictEqual(true)
    })

    it('Tests start_time/end_time to be false if current time does not align', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: null,
          start_time: '09:00:00',
          end_time: '10:00:00'
        })
      ).toStrictEqual(false)
    })

    describe('Tests edge case: start_time > end_time (across midnight). e.g. 7pm-5am', () => {
      it('Tests before midnight (true)', () => {
        Settings.now = () => new Date('2021-09-15T21:00:00.000Z').valueOf()

        expect(
          isRuleActive({
            days: null,
            start_time: '19:00:00',
            end_time: '05:00:00'
          })
        ).toStrictEqual(true)
      })

      it('Tests after midnight (true)', () => {
        Settings.now = () => new Date('2021-09-15T04:00:00.000Z').valueOf()

        expect(
          isRuleActive({
            days: null,
            start_time: '19:00:00',
            end_time: '05:00:00'
          })
        ).toStrictEqual(true)
      })

      it('Tests before midnight (false)', () => {
        Settings.now = () => new Date('2021-09-15T15:00:00.000Z').valueOf()

        expect(
          isRuleActive({
            days: null,
            start_time: '19:00:00',
            end_time: '05:00:00'
          })
        ).toStrictEqual(false)
      })

      it('Tests after midnight (false)', () => {
        Settings.now = () => new Date('2021-09-15T04:00:00.000Z').valueOf()

        expect(
          isRuleActive({
            days: null,
            start_time: '19:00:00',
            end_time: '02:00:00'
          })
        ).toStrictEqual(false)
      })
    })
  })

  describe('Tests only start_time', () => {
    it('Truthy test', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: null,
          start_time: '02:00:00',
          end_time: null
        })
      ).toStrictEqual(true)
    })

    it('Falsy test', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: null,
          start_time: '06:00:00',
          end_time: null
        })
      ).toStrictEqual(false)
    })
  })

  describe('Tests only end_time', () => {
    it('Truthy test', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: null,
          start_time: null,
          end_time: '10:00:00'
        })
      ).toStrictEqual(true)
    })

    it('Falsy test', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: null,
          start_time: null,
          end_time: '04:00:00'
        })
      ).toStrictEqual(false)
    })
  })

  describe('Tests days, start_time, and end_time simultaneously', () => {
    it('Truthy test', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: ['wed'],
          start_time: '02:00:00',
          end_time: '10:00:00'
        })
      ).toStrictEqual(true)
    })

    it('Falsey test (day misalignment)', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: ['mon'],
          start_time: '09:00:00',
          end_time: '10:00:00'
        })
      ).toStrictEqual(false)
    })

    it('Falsey test (time misalignment)', () => {
      Settings.now = () => new Date('2021-09-15T05:00:00.000Z').valueOf()

      expect(
        isRuleActive({
          days: ['wed'],
          start_time: '07:00:00',
          end_time: '08:00:00'
        })
      ).toStrictEqual(false)
    })

    describe('Tests edge case: start_time > end_time (across midnight). e.g. 7pm-5am, with days', () => {
      it('Tests before midnight (true)', () => {
        Settings.now = () => new Date('2021-09-15T21:00:00.000Z').valueOf()

        expect(
          isRuleActive({
            days: ['wed'],
            start_time: '19:00:00',
            end_time: '05:00:00'
          })
        ).toStrictEqual(true)
      })

      it('Tests before midnight (false, day misalignment)', () => {
        Settings.now = () => new Date('2021-09-15T21:00:00.000Z').valueOf()

        expect(
          isRuleActive({
            days: ['thu'],
            start_time: '19:00:00',
            end_time: '05:00:00'
          })
        ).toStrictEqual(false)
      })

      it('Tests before midnight (false, time misalignment)', () => {
        Settings.now = () => new Date('2021-09-15T15:00:00.000Z').valueOf()

        expect(
          isRuleActive({
            days: ['wed'],
            start_time: '19:00:00',
            end_time: '05:00:00'
          })
        ).toStrictEqual(false)
      })
    })
  })
})

describe('Tests isInStatesOrEvents', () => {
  describe('Tests modality matching', () => {
    it('Tests defined modality matching truthiness', () => {
      const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
        vehicle_state: 'available',
        event_types: ['provider_drop_off']
      }

      const partialDevice = <const>{
        modality: 'micromobility'
      }

      const partialRule: Pick<Rule, 'states' | 'modality'> = {
        states: null,
        modality: 'micromobility'
      }

      expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeTruthy()
    })

    it('Tests defined modality matching falsiness', () => {
      const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
        vehicle_state: 'available',
        event_types: ['provider_drop_off']
      }

      const partialDevice = <const>{
        modality: 'micromobility'
      }

      const partialRule: Pick<Rule, 'states' | 'modality'> = {
        states: null,
        modality: 'taxi'
      }

      expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeFalsy()
    })
  })

  describe('Tests states & events matching', () => {
    describe('Tests rule defined states & events', () => {
      it('Tests defined states & events matching truthiness', () => {
        const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
          vehicle_state: 'available',
          event_types: ['provider_drop_off']
        }

        const partialDevice = <const>{
          modality: 'micromobility'
        }

        const partialRule: Pick<Rule, 'states' | 'modality'> = {
          states: {
            available: ['provider_drop_off']
          },
          modality: 'micromobility'
        }

        expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeTruthy()
      })

      it('Tests defined states & events matching falsiness', () => {
        const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
          vehicle_state: 'available',
          event_types: ['trip_end']
        }

        const partialDevice = <const>{
          modality: 'micromobility'
        }

        const partialRule: Pick<Rule, 'states' | 'modality'> = {
          states: {
            available: ['provider_drop_off']
          },
          modality: 'micromobility'
        }

        expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeFalsy()
      })
    })

    describe('Tests rule defined states, empty events', () => {
      it('Tests rule defined states, empty events truthiness', () => {
        const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
          vehicle_state: 'available',
          event_types: ['provider_drop_off']
        }

        const partialDevice = <const>{
          modality: 'micromobility'
        }

        const partialRule: Pick<Rule, 'states' | 'modality'> = {
          states: {
            available: []
          },
          modality: 'micromobility'
        }

        expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeTruthy()
      })

      it('Tests rule defined states, empty events falsiness', () => {
        const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
          vehicle_state: 'available',
          event_types: ['provider_drop_off']
        }

        const partialDevice = <const>{
          modality: 'micromobility'
        }

        const partialRule: Pick<Rule, 'states' | 'modality'> = {
          states: {
            non_operational: []
          },
          modality: 'micromobility'
        }

        expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeFalsy()
      })
    })

    describe('Tests rule undefined states', () => {
      it('Tests rule undefined states (empty object) truthiness', () => {
        const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
          vehicle_state: 'available',
          event_types: ['provider_drop_off']
        }

        const partialDevice = <const>{
          modality: 'micromobility'
        }

        const partialRule: Pick<Rule, 'states' | 'modality'> = {
          states: {},
          modality: 'micromobility'
        }

        expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeTruthy()
      })

      it('Tests rule undefined states (null) truthiness', () => {
        const partialEvent: Pick<VehicleEvent, 'event_types' | 'vehicle_state'> = {
          vehicle_state: 'available',
          event_types: ['provider_drop_off']
        }

        const partialDevice = <const>{
          modality: 'micromobility'
        }

        const partialRule: Pick<Rule, 'states' | 'modality'> = {
          states: null,
          modality: 'micromobility'
        }

        expect(isInStatesOrEvents(partialRule, partialDevice, partialEvent)).toBeTruthy()
      })
    })
  })
})
