import { Dic } from './types'
import Logger from './Logger'
import Path from './Path'
import { Template } from './Template'

async function Tea(
  template_path: string,
  destination_path: string,
  data: Dic<string>
): Promise<void> {
  try {
    const tpl_path = Path(template_path)
    const dest_path = Path(destination_path)
    await dest_path.accessTo()
    await tpl_path
      .copy(dest_path.path)
      .then(async () => {
        const tpl = Template(dest_path.path)
        await tpl.parse(data)
      })
      .catch((error) => {
        throw Logger.error(error)
      })
  } catch (error) {
    throw Logger.error(error)
  }
}

export default Tea
