# promptspec-node

The PromptSpec Node SDK is a simple, efficient library for interfacing with AI language models using YAML PromptSpec files. It enables you to generate dynamic prompts based on user-defined parameters and send them to services such as OpenAI's GPT models.

## Installation

Install the SDK with npm:

```bash
npm install promptspec --save
```

Or with yarn:

```bash
yarn add promptspec
```

## Getting Started

Before using the SDK, you must create a YAML file that defines your prompt specifications. Here is an example of what that YAML could look like:

```yaml
version: 1.2
name: "Character AI"
description: "Responds as the character specified by the user."

parameters:
  type: object
  properties:
    character:
      type: string
      description: "The character's name"
  required: ["character"]

prompt:
  model: "gpt-4"
  messages:
    - role: "system"
      content: "You are {character}. Respond as {character} would."
```

### Using the SDK

Here's how you can use the SDK in your Node.js application:

```javascript
const PromptSpec = require('promptspec');

// Initialize the PromptSpec with the path to your YAML file
const promptSpec = new PromptSpec('path_to_your_prompt_spec.yaml');

// Call the SDK with the required parameters
promptSpec.call({ character: 'Sherlock Holmes' })
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error(error);
  });
```

### Configuration

Set the `OPENAI_API_KEY` in your environment variables to authenticate requests to OpenAI's API:

```bash
export OPENAI_API_KEY='your_openai_api_key'
```

Alternatively, you can use a `.env` file in your project's root with the following content:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Customizing the Request

If you need to customize headers or endpoints, you can directly modify the `headers` and `url` keys within the YAML file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributions

Contributions are welcome! Please feel free to submit a pull request.

## Support

If you have any issues or feature requests, please open an issue on this repo. Keep in mind this is still a work in progress.


