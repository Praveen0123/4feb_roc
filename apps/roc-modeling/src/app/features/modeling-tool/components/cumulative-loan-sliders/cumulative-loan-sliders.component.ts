import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { of } from 'rxjs';

import { OptimizedOutOfPocketLinearPoints, OptimizedOutOfPocketLinearPointsGQL, OptimizedOutOfPocketLinearPointsQueryVariables } from '@gql';
import { RoiModelDto } from '@app/domain';
import * as loanCalculator from '@app/domain/roi-model/domain/loan-calculator';
import { catchError, tap } from 'rxjs/operators';
import { EducationFinancing } from '@app/domain/roi-model/domain';
import { CONFIG } from '@app/config/config';

export interface CumulativeLoanSlidersOutput
{
  outOfPocketExpensesByYear: number[];
  federalSubsidizedLoanAmountByYear: number[];
  federalUnsubsidizedLoanAmountByYear: number[];
  federalLoanAmountByYear: number[];
  privateLoanAmountByYear: number[];
}

@Component({
  selector: 'roc-cumulative-loan-sliders',
  templateUrl: './cumulative-loan-sliders.component.html',
  styleUrls: ['./cumulative-loan-sliders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CumulativeLoanSlidersComponent implements OnInit, OnChanges
{
  @Input() roiModelDto: RoiModelDto;
  @Output() cumulativeLoanSlidersOutputChange = new EventEmitter<CumulativeLoanSlidersOutput>();

  // inputs
  optimizedOutOfPocketLinearPoints: OptimizedOutOfPocketLinearPoints;
  cumulativeNetPrice: number;
  netPriceByYear: number[];
  cumulativeOutOfPocketExpenses: number;
  cumulativeFederalSubsidizedLoanLimit: number;
  cumulativeFederalUnsubsidizedLoanLimit: number;
  yearsToCompleteDegree: number;
  costOfAttendanceByYear: number[];
  grantOrScholarshipAidByYear: number[];
  isTaxDependent: boolean;
  efc: number;
  fullTimeStudentPercent: number;
  yearsToPayOffFederalLoan: number;
  yearsToPayOffPrivateLoan: number;
  sliderStep: number;

  // outputs
  outOfPocketExpensesByYear: number[];
  federalSubsidizedLoanAmountByYear: number[];
  federalUnsubsidizedLoanAmountByYear: number[];
  federalLoanAmountByYear: number[];
  privateLoanAmountByYear: number[];

  // calculated amounts
  cumulativeFederalSubsidizedLoanAmount: number;
  cumulativeFederalUnsubsidizedLoanAmount: number;
  cumulativeFederalLoanAmount: number;
  cumulativePrivateLoanAmount: number;
  cumulativePellGrantAid: number;


  constructor(private optimizedOutOfPocketLinearPointsGQL: OptimizedOutOfPocketLinearPointsGQL) { }

  ngOnInit(): void
  {
    this.setLocalVariables();
    this.onCumulativeOutOfPocketExpensesInput(this.cumulativeOutOfPocketExpenses);
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes.roiModelDto && !changes.roiModelDto.firstChange)
    {
      this.setLocalVariables();
      this.onCumulativeOutOfPocketExpensesInput(this.cumulativeOutOfPocketExpenses);
    }
  }

  setLocalVariables()
  {
    this.checkAndCalculateOutOfPocketLinearPoints();

    this.isTaxDependent = this.roiModelDto.educationFinancing.isTaxDependent;
    this.outOfPocketExpensesByYear = this.roiModelDto.outOfPocketExpensesByYear;
    this.costOfAttendanceByYear = this.roiModelDto.costOfAttendanceByYear;
    this.grantOrScholarshipAidByYear = this.roiModelDto.grantOrScholarshipAidByYear;

    this.netPriceByYear = this.roiModelDto.netPriceByYear;
    this.cumulativeNetPrice = this.arraySum(this.roiModelDto.netPriceByYear);
    this.cumulativeOutOfPocketExpenses = this.arraySum(this.roiModelDto.outOfPocketExpensesByYear);
    this.cumulativeFederalSubsidizedLoanLimit = this.arraySum(this.roiModelDto.federalSubsidizedLoanLimitByYear);
    this.cumulativeFederalUnsubsidizedLoanLimit = this.arraySum(this.roiModelDto.federalUnsubsidizedLoanLimitByYear);
    this.yearsToCompleteDegree = this.roiModelDto.yearsToCompleteDegree;
    this.efc = this.roiModelDto.expectedFamilyContribution;
    this.fullTimeStudentPercent = this.roiModelDto.isFulltime ? 1 : 0.5;
    this.yearsToPayOffFederalLoan = this.roiModelDto.educationFinancing.yearsToPayOffFederalLoan;
    this.yearsToPayOffPrivateLoan = this.roiModelDto.educationFinancing.yearsToPayOffPrivateLoan;
    this.sliderStep = (this.cumulativeNetPrice * .05);
  }

  private shouldCalculateOptimizedOutPocketExpensesPerYear(): boolean
  {
    const oldIsEligibleForSubsidizedLoan = this.efc === null || !this.costOfAttendanceByYear ? true : this.efc > this.arraySum(this.costOfAttendanceByYear);
    const newIsEligibleForSubsidizedLoan = this.roiModelDto.expectedFamilyContribution == null ? true : this.roiModelDto.expectedFamilyContribution > this.arraySum(this.roiModelDto.costOfAttendanceByYear);
    if (
      //TODO: if interest rates change, compare them here
      !this.arraysEqual(this.netPriceByYear, this.roiModelDto?.netPriceByYear)
      || this.yearsToCompleteDegree !== this.roiModelDto.yearsToCompleteDegree
      || this.isTaxDependent !== this.roiModelDto.educationFinancing.isTaxDependent
      || this.yearsToPayOffFederalLoan !== this.roiModelDto.educationFinancing.yearsToPayOffFederalLoan
      || this.yearsToPayOffPrivateLoan !== this.roiModelDto.educationFinancing.yearsToPayOffPrivateLoan
      || oldIsEligibleForSubsidizedLoan !== newIsEligibleForSubsidizedLoan
    )
    {
      return true;
    }
    return false;
  }

  private shouldResetOptimizedOutPocketExpensesPerYear(): boolean
  {
    if (this.roiModelDto?.netPriceByYear == null || this.arraySum(this.roiModelDto.netPriceByYear) === 0
      || !this.roiModelDto?.yearsToCompleteDegree
      || this.roiModelDto?.educationFinancing.isTaxDependent == null
      || !this.roiModelDto.educationFinancing.yearsToPayOffFederalLoan
      || !this.roiModelDto.educationFinancing.yearsToPayOffPrivateLoan
      || this.roiModelDto?.costOfAttendanceByYear == null || this.arraySum(this.roiModelDto.costOfAttendanceByYear) === 0)
    {
      return true;
    }

    return false;
  }

  private resetOptimizedOutPocketExpensesPerYear()
  {
    const defaultProps = EducationFinancing.defaultProps;
    const cumulativeLoanSlidersOutput: CumulativeLoanSlidersOutput = {
      outOfPocketExpensesByYear: defaultProps.outOfPocketExpensesByYear,
      federalSubsidizedLoanAmountByYear: defaultProps.federalSubsidizedLoanAmountByYear,
      federalUnsubsidizedLoanAmountByYear: defaultProps.federalUnsubsidizedLoanAmountByYear,
      federalLoanAmountByYear: defaultProps.federalLoanAmountByYear,
      privateLoanAmountByYear: defaultProps.privateLoanAmountByYear
    };

    this.cumulativeLoanSlidersOutputChange.emit(cumulativeLoanSlidersOutput);
  }

  checkAndCalculateOutOfPocketLinearPoints()
  {
    const shouldCalculateOptimizedOutPocketExpensesPerYear = this.shouldCalculateOptimizedOutPocketExpensesPerYear();
    if (shouldCalculateOptimizedOutPocketExpensesPerYear)
    {
      const shouldResetOptimizedOutPocketExpensesPerYear = this.shouldResetOptimizedOutPocketExpensesPerYear();
      if (shouldResetOptimizedOutPocketExpensesPerYear)
      {
        this.resetOptimizedOutPocketExpensesPerYear();
      } else
      {
        const isEligibleForSubsidizedLoan = this.roiModelDto.expectedFamilyContribution == null ? true : this.roiModelDto.expectedFamilyContribution > this.arraySum(this.roiModelDto.costOfAttendanceByYear);
        this.calculateOptimizedOutPocketExpensesPerYear({
          netPriceByYear: this.roiModelDto.netPriceByYear,
          numYears: this.roiModelDto.yearsToCompleteDegree,
          isTaxIndependent: !this.roiModelDto.educationFinancing.isTaxDependent,
          federalLoanYears: this.roiModelDto.educationFinancing.yearsToPayOffFederalLoan,
          federalLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_FEDERAL_LOAN_INTEREST_RATE,
          privateLoanYears: this.roiModelDto.educationFinancing.yearsToPayOffPrivateLoan,
          privateLoanInterest: CONFIG.EDUCATION_FINANCING.DEFAULT_PRIVATE_LOAN_INTEREST_RATE,
          isEligibleForSubsidizedLoan: isEligibleForSubsidizedLoan
        });
      }
    }
  }

  calculateOptimizedOutPocketExpensesPerYear(optimizedOutOfPocketLinearPointsQueryVariables: OptimizedOutOfPocketLinearPointsQueryVariables): void
  {
    this.optimizedOutOfPocketLinearPointsGQL.fetch(optimizedOutOfPocketLinearPointsQueryVariables).pipe(
      tap(response =>
      {
        let areNewOptimizedPoints = false;
        if (this.optimizedOutOfPocketLinearPoints?.x.length !== response.data.optimizedOutOfPocketLinearPoints.x.length)
        {
          areNewOptimizedPoints = true;
        }
        else
        {
          for (let index = 0; index < this.optimizedOutOfPocketLinearPoints.x.length; index++)
          {
            const currentX = this.optimizedOutOfPocketLinearPoints.x[index];
            const currentY = this.optimizedOutOfPocketLinearPoints.y[index];
            const newX = response.data.optimizedOutOfPocketLinearPoints.x[index];
            const newY = response.data.optimizedOutOfPocketLinearPoints.y[index];

            if (!this.arraysEqual(currentX, newX) || !this.arraysEqual(currentY, newY))
            {
              areNewOptimizedPoints = true;
              break;
            }
          }
        }

        this.optimizedOutOfPocketLinearPoints = response.data.optimizedOutOfPocketLinearPoints;

        if (areNewOptimizedPoints)
        {
          const cumulativeOutOfPocketExpenses = this.arraySum(this.roiModelDto.outOfPocketExpensesByYear);
          this.onCumulativeOutOfPocketExpensesChange(cumulativeOutOfPocketExpenses);
        }
      }),
      catchError((error) =>
      {
        console.log('OPTIMIZED OUT OF POCKET EXPENSES ERROR:', error);
        return of(error);
      }),
    ).subscribe();
  }

  onCumulativeOutOfPocketExpensesInput(cumulativeOutOfPocketExpenses: number)
  {
    let outOfPocketExpensesByYear = [];

    if (this.optimizedOutOfPocketLinearPoints)
    {
      for (let i = 0; i < this.yearsToCompleteDegree; i++)
      {
        const outOfPocketExpensesForYear = this.interpolate(this.optimizedOutOfPocketLinearPoints.x[i], this.optimizedOutOfPocketLinearPoints.y[i], cumulativeOutOfPocketExpenses);
        outOfPocketExpensesByYear.push(outOfPocketExpensesForYear);
      }
    } else
    {
      outOfPocketExpensesByYear = this.outOfPocketExpensesByYear;
    }


    const modeledLoansByYear = loanCalculator.calculateLoansByYear(
      this.costOfAttendanceByYear,
      outOfPocketExpensesByYear,
      this.grantOrScholarshipAidByYear,
      this.yearsToCompleteDegree,
      !this.isTaxDependent,
      this.efc
    );

    this.outOfPocketExpensesByYear = outOfPocketExpensesByYear;
    this.federalSubsidizedLoanAmountByYear = modeledLoansByYear.federalSubsidizedLoanAmountByYear;
    this.federalUnsubsidizedLoanAmountByYear = modeledLoansByYear.federalUnsubsidizedLoanAmountByYear;
    this.federalLoanAmountByYear = modeledLoansByYear.federalLoanAmountByYear;
    this.privateLoanAmountByYear = modeledLoansByYear.privateLoanAmountByYear;
    this.privateLoanAmountByYear = modeledLoansByYear.privateLoanAmountByYear;

    this.cumulativeFederalSubsidizedLoanAmount = this.arraySum(this.federalSubsidizedLoanAmountByYear);
    this.cumulativeFederalUnsubsidizedLoanAmount = this.arraySum(this.federalUnsubsidizedLoanAmountByYear);
    this.cumulativeFederalLoanAmount = this.arraySum(this.federalLoanAmountByYear);
    this.cumulativePrivateLoanAmount = this.arraySum(this.privateLoanAmountByYear);

  }

  onCumulativeOutOfPocketExpensesChange(cumulativeOutOfPocketExpenses: number)
  {
    this.onCumulativeOutOfPocketExpensesInput(cumulativeOutOfPocketExpenses);
    const cumulativeLoanSlidersOutput: CumulativeLoanSlidersOutput = {
      outOfPocketExpensesByYear: this.outOfPocketExpensesByYear,
      federalSubsidizedLoanAmountByYear: this.federalSubsidizedLoanAmountByYear,
      federalUnsubsidizedLoanAmountByYear: this.federalUnsubsidizedLoanAmountByYear,
      federalLoanAmountByYear: this.federalLoanAmountByYear,
      privateLoanAmountByYear: this.privateLoanAmountByYear
    };

    this.cumulativeLoanSlidersOutputChange.emit(cumulativeLoanSlidersOutput);
  }

  arraySum(numberArray: number[]): number
  {
    return numberArray.reduce((p, c) => p + c, 0);
  };

  private interpolate(x: number[], y: number[], t: number)
  {
    const n = x.length;
    let j;
    let found = false;

    if (t < x[0] || t > x[n - 1])
    {
      j = 0;
      found = true;
    }

    if (t > x[n - 1])
    {
      j = n - 2;
      found = true;
    }

    for (let i = 0; i < n - 1 && !found; i++)
    {
      if (t >= x[i] && t <= x[i + 1])
      {
        j = i;
        found = true;
      }
    }

    if (!found)
    {
      const error1 = 'error in logic';
      throw error1;
    }

    const k = (y[j + 1] - y[j]) / (x[j + 1] - x[j]);
    const result = y[j] + k * (t - x[j]);
    return result;
  };

  private arraysEqual(a: number[], b: number[])
  {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (let i = 0; i < a.length; ++i)
    {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

}
