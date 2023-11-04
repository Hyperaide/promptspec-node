const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');
require('dotenv').config();

class PromptSpecError extends Error {}
class FileNotFoundError extends PromptSpecError {}
class ParseError extends PromptSpecError {}
class RequiredParameterError extends PromptSpecError {}
class EndpointError extends PromptSpecError {}

class PromptSpec {
  constructor(filePath, validateRequiredParams = true) {
    this.filePath = filePath;
    this.validateRequiredParams = validateRequiredParams;
    this.loadParseFile();
  }

  loadParseFile() {
    try {
      const path = this.filePath;
      if (!fs.existsSync(path)) {
        throw new FileNotFoundError(`File not found: ${path}`);
      }
      this.yamlContent = yaml.load(fs.readFileSync(path, 'utf8'));
    } catch (e) {
      if (e instanceof yaml.YAMLException) {
        throw new ParseError(`YAML parsing error: ${e.message}`);
      } else {
        throw e;
      }
    }
  }

  validateRequiredInputs() {
    const requiredParams = this.yamlContent.parameters.required || [];
    const missingParams = requiredParams.filter(param => !(param in this.parameters));
    if (missingParams.length > 0) {
      throw new RequiredParameterError(`Missing required parameters: ${missingParams.join(', ')}`);
    }
  }

  parsePromptMessages() {
    this.yamlContent.prompt.messages.forEach(message => {
      let content = message.content;
      Object.entries(this.parameters).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{${key}}`, 'g'), value);
      });
      message.content = content;
    });
  }

  async constructEndpointRequest() {
    try {
      const endpoint = this.yamlContent.endpoint || this.constructDefaultEndpoint();
      const headers = this.constructHeaders();
      const payload = this.yamlContent.prompt;
      
      const response = await axios.post(endpoint, payload, { headers });
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  }

  constructDefaultEndpoint() {
    this.model = this.model || this.yamlContent.prompt.model;
    switch (this.model) {
      case 'gpt-4':
      case 'gpt-4-0613':
      case 'gpt-4-32k':
      case 'gpt-4-32k-0613':
      case 'gpt-3.5-turbo':
      case 'gpt-3.5-turbo-16k':
      case 'gpt-3.5-turbo-0613':
      case 'gpt-3.5-turbo-16k-0613':
        return 'https://api.openai.com/v1/chat/completions';
      default:
        throw new EndpointError(`Unknown model: ${this.model}`);
    }
  }

  constructHeaders() {
    if (!this.headers) {
      let headers = this.yamlContent.headers || {};
  
      if (Object.keys(headers).length === 0) {
        switch (this.model) {
          case 'gpt-4':
          case 'gpt-4-0613':
          case 'gpt-4-32k':
          case 'gpt-4-32k-0613':
          case 'gpt-3.5-turbo':
          case 'gpt-3.5-turbo-16k':
          case 'gpt-3.5-turbo-0613':
          case 'gpt-3.5-turbo-16k-0613':
            const apiKey = process.env.OPENAI_API_KEY;
            if (apiKey) {
              headers['Authorization'] = `Bearer ${apiKey}`;
            }
            // Add more cases here for other providers
            break;
        }
      }
  
      if (!('Content-Type' in headers)) {
        headers['Content-Type'] = 'application/json';
      }
  
      this.headers = headers;
    }
  
    return this.headers;
  }

  async call(parameters) {
    this.parameters = parameters;
    if (this.validateRequiredParams) {
      this.validateRequiredInputs();
    }
    this.parsePromptMessages();
    return await this.constructEndpointRequest();
  }
}

module.exports = PromptSpec;
