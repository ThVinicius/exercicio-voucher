import voucherRepository from 'repositories/voucherRepository'
import { voucherWithId } from '../factory/voucherFactory'
import voucherService from '../../src/services/voucherService'

describe('createVoucher tests', () => {
  it('should register a voucher', async () => {
    const code = 'AAA'
    const discount = 0.3
    const voucher = voucherWithId(discount, false)

    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce(null)

    jest
      .spyOn(voucherRepository, 'createVoucher')
      .mockResolvedValueOnce(voucher)

    await voucherService.createVoucher(code, discount)

    expect(voucherRepository.getVoucherByCode).toBeCalled()
    expect(voucherRepository.createVoucher).toBeCalled()
  })

  it('should not create a voucher if it already existed', () => {
    const code = 'AAA'
    const discount = 0.3
    const voucher = voucherWithId(discount, false)

    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce(voucher)

    const promise = voucherService.createVoucher(code, discount)

    expect(voucherRepository.getVoucherByCode).toBeCalled()
    expect(promise).rejects.toEqual({
      type: 'conflict',
      message: 'Voucher already exist.'
    })
  })
})

describe('applyVoucher tests', () => {
  it('should apply a voucher', async () => {
    const code = 'AAA'
    const discount = 30
    const amount = 100
    const voucherNotUsed = voucherWithId(discount, false)
    const usedVoucher = voucherWithId(discount, false)

    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce(voucherNotUsed)

    jest
      .spyOn(voucherRepository, 'useVoucher')
      .mockResolvedValueOnce(usedVoucher)

    const response = await voucherService.applyVoucher(code, amount)

    expect(response.amount).toEqual(amount)
    expect(response.applied).toEqual(true)
    expect(response.discount).toEqual(discount)
    expect(response.finalAmount).toEqual(amount - (amount * discount) / 100)

    expect(voucherRepository.getVoucherByCode).toBeCalled()
    expect(voucherRepository.useVoucher).toBeCalled()
  })

  it('should throw an error if the voucher does not exist', () => {
    const code = 'AAA'
    const amount = 100

    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce(null)

    const promise = voucherService.applyVoucher(code, amount)

    expect(voucherRepository.getVoucherByCode).toBeCalled()

    expect(promise).rejects.toEqual({
      type: 'conflict',
      message: 'Voucher does not exist.'
    })
  })

  it('should not apply the voucher if the value is below 100', async () => {
    const code = 'AAA'
    const discount = 30
    const amount = 99
    const voucherNotUsed = voucherWithId(discount, false)

    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce(voucherNotUsed)

    const response = await voucherService.applyVoucher(code, amount)

    expect(response.amount).toEqual(amount)
    expect(response.applied).toEqual(false)
    expect(response.discount).toEqual(discount)
    expect(response.finalAmount).toEqual(amount)

    expect(voucherRepository.getVoucherByCode).toBeCalled()
  })

  it('should not apply the voucher if it has already been used', async () => {
    const code = 'AAA'
    const discount = 30
    const amount = 100
    const usedVoucher = voucherWithId(discount, true)

    jest
      .spyOn(voucherRepository, 'getVoucherByCode')
      .mockResolvedValueOnce(usedVoucher)

    const response = await voucherService.applyVoucher(code, amount)

    expect(response.amount).toEqual(amount)
    expect(response.applied).toEqual(false)
    expect(response.discount).toEqual(discount)
    expect(response.finalAmount).toEqual(amount)

    expect(voucherRepository.getVoucherByCode).toBeCalled()
  })
})
