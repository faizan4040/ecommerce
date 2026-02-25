'use client'
import React from 'react'

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex flex-1 relative md:flex-col md:items-center">
            {/* Step Circle */}
            <div className="flex items-center justify-center">
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  transition-all duration-500
                  ${isCompleted ? 'bg-green-500 border-green-500' : ''}
                  ${isActive ? 'bg-yellow-400 border-yellow-400 animate-pulse' : 'bg-white border-gray-300'}
                `}
              >
                {isCompleted ? (
                  <span className="text-white font-bold">✓</span>
                ) : (
                  <span className={`${isActive ? 'animate-pulse' : ''} text-xs text-gray-700`}>
                    {index + 1}
                  </span>
                )}
              </div>
            </div>

            {/* Step Label */}
            <div className="mt-2 md:mt-3 text-center md:text-left flex flex-col items-center">
              <p className={`font-medium ${isActive ? 'text-yellow-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                {step.title}
              </p>
              {step.sub && (
                <p className="text-xs text-gray-500 mt-1">{step.sub}</p>
              )}
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  absolute top-4 md:top-5 left-8 md:left-4 w-full md:w-0.5 h-0.5 md:h-full
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  transition-all duration-500
                `}
                style={{ transform: 'translateX(50%)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Stepper