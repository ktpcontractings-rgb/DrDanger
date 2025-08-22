import React, { useState, useEffect } from 'react';

const StepByStepGuide = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepStatus, setStepStatus] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Task Templates
  const taskTemplates = {
    'domain-setup': {
      title: 'Domain & Hosting Setup',
      description: 'Complete domain registration and hosting configuration',
      estimatedTime: '30-45 minutes',
      difficulty: 'Beginner',
      steps: [
        {
          id: 'domain-purchase',
          title: 'Purchase Domain',
          description: 'Register your custom domain name',
          type: 'manual',
          instructions: [
            'Go to Namecheap.com or GoDaddy.com',
            'Search for your desired domain name',
            'Add to cart and complete purchase',
            'Save your login credentials securely'
          ],
          validation: 'domain-ownership',
          estimatedTime: '10 minutes'
        },
        {
          id: 'cloudflare-setup',
          title: 'Setup Cloudflare',
          description: 'Configure CDN and DNS management',
          type: 'guided',
          instructions: [
            'Create free Cloudflare account',
            'Add your domain to Cloudflare',
            'Update nameservers at your registrar',
            'Wait for DNS propagation (up to 24 hours)'
          ],
          validation: 'dns-propagation',
          estimatedTime: '15 minutes'
        },
        {
          id: 'ssl-setup',
          title: 'SSL Certificate',
          description: 'Enable HTTPS security',
          type: 'automated',
          instructions: [
            'Cloudflare will automatically provision SSL',
            'Verify SSL certificate is active',
            'Test HTTPS access to your domain'
          ],
          validation: 'ssl-active',
          estimatedTime: '5 minutes'
        },
        {
          id: 'deployment',
          title: 'Deploy Application',
          description: 'Connect domain to your application',
          type: 'guided',
          instructions: [
            'Add custom domain in Vercel/Railway',
            'Configure DNS records in Cloudflare',
            'Test application accessibility',
            'Verify all features are working'
          ],
          validation: 'app-accessible',
          estimatedTime: '10 minutes'
        }
      ]
    },
    'affiliate-setup': {
      title: 'Affiliate Marketing Setup',
      description: 'Complete affiliate program registration and optimization',
      estimatedTime: '60-90 minutes',
      difficulty: 'Intermediate',
      steps: [
        {
          id: 'business-registration',
          title: 'Business Registration',
          description: 'Ensure legal business entity is established',
          type: 'manual',
          instructions: [
            'Verify LLC registration is current',
            'Obtain EIN if not already done',
            'Set up business bank account',
            'Prepare business documentation'
          ],
          validation: 'business-verified',
          estimatedTime: '20 minutes'
        },
        {
          id: 'affiliate-applications',
          title: 'Apply to Affiliate Programs',
          description: 'Submit applications to high-paying programs',
          type: 'guided',
          instructions: [
            'Amazon Associates application',
            'ClickBank vendor approval',
            'Commission Junction registration',
            'ShareASale application'
          ],
          validation: 'programs-approved',
          estimatedTime: '30 minutes'
        },
        {
          id: 'tracking-setup',
          title: 'Tracking & Analytics',
          description: 'Implement comprehensive tracking system',
          type: 'automated',
          instructions: [
            'Install Google Analytics 4',
            'Set up Facebook Pixel',
            'Configure affiliate link tracking',
            'Implement conversion tracking'
          ],
          validation: 'tracking-active',
          estimatedTime: '20 minutes'
        },
        {
          id: 'content-creation',
          title: 'Content Strategy',
          description: 'Create high-converting content',
          type: 'guided',
          instructions: [
            'Research profitable products',
            'Create product comparison pages',
            'Write SEO-optimized reviews',
            'Set up email capture system'
          ],
          validation: 'content-published',
          estimatedTime: '20 minutes'
        }
      ]
    },
    'legal-compliance': {
      title: 'Legal Compliance Setup',
      description: 'Ensure full legal compliance for affiliate marketing',
      estimatedTime: '45-60 minutes',
      difficulty: 'Beginner',
      steps: [
        {
          id: 'affiliate-disclosure',
          title: 'Affiliate Disclosure',
          description: 'Create FTC-compliant disclosure pages',
          type: 'automated',
          instructions: [
            'Generate affiliate disclosure page',
            'Add disclosure to website footer',
            'Include disclosure in content',
            'Verify compliance with FTC guidelines'
          ],
          validation: 'disclosure-active',
          estimatedTime: '15 minutes'
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          description: 'Create GDPR/CCPA compliant privacy policy',
          type: 'automated',
          instructions: [
            'Generate privacy policy based on business',
            'Include cookie consent management',
            'Add data collection disclosures',
            'Implement user rights management'
          ],
          validation: 'privacy-policy-active',
          estimatedTime: '15 minutes'
        },
        {
          id: 'terms-of-service',
          title: 'Terms of Service',
          description: 'Create comprehensive terms of service',
          type: 'automated',
          instructions: [
            'Generate terms of service',
            'Include limitation of liability',
            'Add dispute resolution clauses',
            'Specify governing law'
          ],
          validation: 'terms-active',
          estimatedTime: '15 minutes'
        }
      ]
    },
    'marketing-automation': {
      title: 'Marketing Automation Setup',
      description: 'Implement automated marketing systems',
      estimatedTime: '90-120 minutes',
      difficulty: 'Advanced',
      steps: [
        {
          id: 'email-marketing',
          title: 'Email Marketing System',
          description: 'Set up automated email campaigns',
          type: 'guided',
          instructions: [
            'Create Mailchimp/ConvertKit account',
            'Design email capture forms',
            'Set up welcome email sequence',
            'Create product promotion campaigns'
          ],
          validation: 'email-system-active',
          estimatedTime: '30 minutes'
        },
        {
          id: 'social-media',
          title: 'Social Media Automation',
          description: 'Automate social media posting',
          type: 'guided',
          instructions: [
            'Connect social media accounts',
            'Set up posting schedule',
            'Create content templates',
            'Implement engagement automation'
          ],
          validation: 'social-automation-active',
          estimatedTime: '30 minutes'
        },
        {
          id: 'seo-optimization',
          title: 'SEO Optimization',
          description: 'Optimize for search engines',
          type: 'automated',
          instructions: [
            'Install SEO tracking tools',
            'Optimize page titles and descriptions',
            'Create XML sitemap',
            'Submit to search engines'
          ],
          validation: 'seo-optimized',
          estimatedTime: '30 minutes'
        }
      ]
    }
  };

  const startTask = (taskType) => {
    const task = taskTemplates[taskType];
    if (task) {
      setCurrentTask({ ...task, type: taskType });
      setCurrentStep(0);
      setProgress(0);
      setStepStatus({});
    }
  };

  const executeStep = async (stepIndex) => {
    if (!currentTask || isExecuting) return;
    
    setIsExecuting(true);
    const step = currentTask.steps[stepIndex];
    
    try {
      // Update step status to executing
      setStepStatus(prev => ({
        ...prev,
        [step.id]: 'executing'
      }));

      // Simulate step execution based on type
      if (step.type === 'automated') {
        // Automated execution
        await simulateAutomatedExecution(step);
        setStepStatus(prev => ({
          ...prev,
          [step.id]: 'completed'
        }));
      } else if (step.type === 'guided') {
        // Guided execution with user interaction
        setStepStatus(prev => ({
          ...prev,
          [step.id]: 'in-progress'
        }));
      } else {
        // Manual execution - just mark as in progress
        setStepStatus(prev => ({
          ...prev,
          [step.id]: 'in-progress'
        }));
      }
    } catch (error) {
      setStepStatus(prev => ({
        ...prev,
        [step.id]: 'error'
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateAutomatedExecution = async (step) => {
    // Simulate API calls and automated tasks
    return new Promise(resolve => {
      setTimeout(resolve, 2000 + Math.random() * 3000);
    });
  };

  const markStepComplete = (stepIndex) => {
    const step = currentTask.steps[stepIndex];
    setStepStatus(prev => ({
      ...prev,
      [step.id]: 'completed'
    }));
    
    // Update progress
    const completedSteps = Object.values({
      ...stepStatus,
      [step.id]: 'completed'
    }).filter(status => status === 'completed').length;
    
    setProgress((completedSteps / currentTask.steps.length) * 100);
    
    // Auto-advance to next step if not last
    if (stepIndex < currentTask.steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const getStepIcon = (stepId) => {
    const status = stepStatus[stepId];
    switch (status) {
      case 'completed':
        return '✅';
      case 'executing':
        return '⏳';
      case 'in-progress':
        return '🔄';
      case 'error':
        return '❌';
      default:
        return '⭕';
    }
  };

  const getStepColor = (stepId) => {
    const status = stepStatus[stepId];
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'executing':
        return 'text-blue-600 bg-blue-50';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!currentTask) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 Step-by-Step Business Setup
          </h2>
          <p className="text-lg text-gray-600">
            Let Dr. Danger guide you through complex business tasks with automated execution and real-time assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(taskTemplates).map(([taskType, task]) => (
            <div
              key={taskType}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => startTask(taskType)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  task.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {task.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{task.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>⏱️ {task.estimatedTime}</span>
                <span>📋 {task.steps.length} steps</span>
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Start Task
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Task Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentTask.title}</h2>
            <p className="text-gray-600">{currentTask.description}</p>
          </div>
          <button
            onClick={() => setCurrentTask(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>⏱️ {currentTask.estimatedTime}</span>
          <span>📋 {currentTask.steps.length} steps</span>
          <span className={`px-2 py-1 rounded ${
            currentTask.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
            currentTask.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {currentTask.difficulty}
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {currentTask.steps.map((step, index) => (
          <div
            key={step.id}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
              index === currentStep ? 'border-blue-500' : 'border-gray-200'
            } ${getStepColor(step.id)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStepIcon(step.id)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  step.type === 'automated' ? 'bg-green-100 text-green-800' :
                  step.type === 'guided' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {step.type}
                </span>
                <span className="text-sm text-gray-500">⏱️ {step.estimatedTime}</span>
              </div>
            </div>

            {/* Step Instructions */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
              <ul className="space-y-1">
                {step.instructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step Actions */}
            <div className="flex items-center gap-3">
              {step.type === 'automated' && stepStatus[step.id] !== 'completed' && (
                <button
                  onClick={() => executeStep(index)}
                  disabled={isExecuting}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stepStatus[step.id] === 'executing' ? 'Executing...' : 'Auto Execute'}
                </button>
              )}
              
              {(step.type === 'guided' || step.type === 'manual') && stepStatus[step.id] !== 'completed' && (
                <button
                  onClick={() => markStepComplete(index)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Mark Complete
                </button>
              )}
              
              {stepStatus[step.id] === 'completed' && (
                <span className="text-green-600 font-medium">✅ Completed</span>
              )}
              
              {stepStatus[step.id] === 'error' && (
                <button
                  onClick={() => executeStep(index)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Completion */}
      {progress === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-900 mb-2">Task Completed!</h3>
          <p className="text-green-700 mb-4">
            Congratulations! You have successfully completed the {currentTask.title} setup.
          </p>
          <button
            onClick={() => setCurrentTask(null)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Start Another Task
          </button>
        </div>
      )}
    </div>
  );
};

export default StepByStepGuide;

