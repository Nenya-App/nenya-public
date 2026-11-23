import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { Cite, ReferenceList } from './AboutReferences';

// "Where we stand": what Nenya says about genocide, apartheid, occupation and colonization, and what it will not do (docs/drafts/history-and-violence-text-draft.md, approved
// by the owner 2026-11-10). Reworded 2026-11-22 from the About thesis (docs/about-thesis.md): a court's findings, a body's conclusions and our own position are now told apart, and
// every legal or historical claim carries a numbered reference. The facts move, and the coach cannot search the web, so this page carries a "last reviewed" date and the owner
// (or a session, on request) updates it.
export const WHERE_WE_STAND_REVIEWED = '22 November 2026';

const link = 'underline underline-offset-2';
const L = ({ href, children }: { href: string; children: string }) => (
  <a href={href} className={link} target="_blank" rel="noopener noreferrer">
    {children}
    <span className="sr-only"> (opens an outside site in a new tab)</span>
  </a>
);

export default function WhereWeStand({ onBack }: { onBack: () => void }) {
  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <h1 className="text-3xl">Where We Stand</h1>
        <p className="text-sm text-muted-foreground">On genocide, apartheid, occupation and colonization. Last reviewed {WHERE_WE_STAND_REVIEWED}. The facts here can change, and a court can rule at any time. This page is updated by hand.</p>
        <Card className="space-y-4 p-6 leading-relaxed">
          <p>Our position starts from one idea: every person is a person, and what someone feels and needs matters. That is why we treat genocide, apartheid and occupation as questions of law and evidence, not of taste. Where a court or a body we name has decided, we say what it decided. Where none has, we say that too. We will not help anyone make a group of people seem less than human.</p>

          <h2 className="text-xl">What we say about history</h2>
          <p>We say what happened. The Holocaust happened. So did the genocides in Armenia, Rwanda, Bosnia and Cambodia.</p>
          <p>Courts have ruled on three of these. In Rwanda, an international tribunal convicted a local official of genocide in 1998 <Cite pageId="stand" n={[1]} />. In Bosnia, the International Court of Justice found in 2007 that genocide took place at Srebrenica in July 1995. It found that Serbia did not commit it, but failed to prevent it and to punish it <Cite pageId="stand" n={[2]} />. In Cambodia, a UN-backed court convicted a Khmer Rouge leader of genocide against the ethnic Vietnamese, and judged the wider killings as crimes against humanity <Cite pageId="stand" n={[3]} />. No court has ruled on the Armenian genocide that began in 1915. Historians, and since 2021 the United States, recognise it as genocide <Cite pageId="stand" n={[4, 5]} />.</p>
          <p>The United States was built in part on slavery and on the taking of land from Native peoples <Cite pageId="stand" n={[6, 7]} />. That included massacres, forced removal and boarding schools that took children from their families. The US Interior Department investigated the federal boarding schools and published its findings <Cite pageId="stand" n={[8]} />. In October 2024 President Biden formally apologized for those schools <Cite pageId="stand" n={[9]} />.</p>
          <p>Colonization, the taking of land and the rule of peoples by force, shaped much of the world. Studies find effects that last for generations <Cite pageId="stand" n={[10, 11, 12]} />. In 1960 the UN General Assembly said that ruling a people by alien domination denies basic human rights <Cite pageId="stand" n={[13]} />.</p>
          <p>On these facts, we do not give a second side.</p>

          <h2 className="text-xl">What we say about Israel and Palestine</h2>
          <p>On 19 July 2024 the International Court of Justice (ICJ), the UN&rsquo;s main court, gave an advisory opinion. It said Israel&rsquo;s continued presence in the Occupied Palestinian Territory is unlawful <Cite pageId="stand" n={[14, 15, 16]} />. The vote was 11 to 4. This was an advisory opinion. It answers a question from the UN General Assembly. It is not a judgment in a case between states. Israel&rsquo;s government rejects the opinion.</p>
          <p>The Court said Israel must end its presence as rapidly as possible. It said other states must not recognise the situation or help to maintain it <Cite pageId="stand" n={[14]} />.</p>
          <p>In a second advisory opinion, on 22 October 2025, the Court spoke of Israel as the occupying power. It said Israel must make sure the population has essential supplies, such as food, water and medical care. It said Israel must agree to relief schemes and help them. It said Israel must respect the ban on starving civilians as a method of warfare <Cite pageId="stand" n={[17, 18]} />.</p>
          <p>Three leading human rights organizations have concluded that Israel&rsquo;s rule over Palestinians amounts to apartheid. They are B&rsquo;Tselem, an Israeli organization (2021) <Cite pageId="stand" n={[19]} />; Human Rights Watch (2021) <Cite pageId="stand" n={[20]} />; and Amnesty International (2022) <Cite pageId="stand" n={[21]} />. Human Rights Watch found the crimes against humanity of apartheid and persecution. These are organizations, not courts. In 2024 the ICJ found that Israeli measures in the West Bank and East Jerusalem breach Article 3 of the anti-discrimination convention (CERD). That article bans racial segregation and apartheid. The Court did not rule on the crime of apartheid <Cite pageId="stand" n={[14]} />. Scholars have studied whether the legal term fits <Cite pageId="stand" n={[22]} />. Israel&rsquo;s government rejects the label. We agree with the organizations.</p>
          <p>Several bodies have concluded that Israel&rsquo;s actions in Gaza since October 2023 are genocide. One is an independent UN commission of inquiry (16 September 2025) <Cite pageId="stand" n={[23]} />. Another is Amnesty International (5 December 2024) <Cite pageId="stand" n={[24]} />. Two Israeli organizations, B&rsquo;Tselem and Physicians for Human Rights Israel, said so on 28 July 2025 <Cite pageId="stand" n={[25]} />. Israel&rsquo;s government rejects these conclusions <Cite pageId="stand" n={[26]} />. None of these bodies is a court.</p>
          <p>We agree with them. That is our position. It is not a court&rsquo;s ruling.</p>
          <p>No court has yet ruled on whether genocide happened. South Africa brought a case against Israel at the ICJ in December 2023. On 26 January 2024 the Court found that at least some of the rights South Africa claims are plausible. It found a real and imminent risk of serious harm to them. It ordered Israel to take protective steps. It did not decide whether genocide has happened. It ordered further steps on 28 March and 24 May 2024 <Cite pageId="stand" n={[27, 28, 29]} />. As of 22 September 2026 the case was still at the written stage <Cite pageId="stand" n={[28]} />. The two earlier genocide cases to reach a final ICJ judgment took well over ten years <Cite pageId="stand" n={[29]} />. Legal scholars disagree about whether the evidence meets the high bar for proving intent <Cite pageId="stand" n={[30, 31, 32]} />. We do not think the dead should have to wait for a verdict for us to say what we believe.</p>
          <p>We also say that the attack on 7 October 2023 killed about 1,200 people, mostly civilians, and took about 250 hostages <Cite pageId="stand" n={[29]} />. We say these were atrocities. Being Jewish does not make anyone responsible for what the Israeli government does <Cite pageId="stand" n={[33]} />. People are responsible for what they themselves do or order. That is our position.</p>
          <p>Being Palestinian does not make anyone responsible for what Hamas does.</p>

          <h2 className="text-xl">Belief and feeling</h2>
          <p>We treat every belief, religious ones included, the way we treat any thought: with care for the feeling and the need under it. If a belief is hurt by being questioned, that hurt is real and we will listen to it. It does not make the belief true, and it does not make it off limits.</p>

          <h2 className="text-xl">If you have survived violence</h2>
          <p>What you feel is yours. Rage, grief, fear and mistrust after violence deserve to be heard. The coach is set up not to tell you to feel differently and not to call it your fault. It can get this wrong. Listening to anger is not agreeing with a plan for harm, and we will not help anyone justify violence against a people.</p>

          <h2 className="text-xl">The same line in every direction</h2>
          <p>This goes for anyone. We will not describe settlers, colonizers or occupiers as vermin. We will not describe the colonized that way either. We will not help anyone call for a whole people to be driven out or wiped out, whoever they are and wherever they are. Psychologists call describing people as vermin or animals dehumanization <Cite pageId="stand" n={[34, 35]} />. The Genocide Convention makes direct and public incitement to genocide punishable <Cite pageId="stand" n={[36]} />. Anger at a system that took land or freedom deserves to be heard, and we will listen to it. Wanting the system to end is not wanting its people gone.</p>

          <h2 className="text-xl">What we will not do</h2>
          <p>We will not describe people as animals, vermin, disease or less than human. We will not justify genocide, ethnic cleansing, apartheid, collective punishment or mass violence by anyone, and we will not help deny that documented genocides happened. If you say something like that to the coach, it is set up to tell you plainly that it disagrees. It is set up to say what the record shows, offer you something to read, and ask what is behind it for you. It is set up not to shame you and not to pretend to agree. It can get this wrong.</p>

          <h2 className="text-xl">Where you can learn more</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><L href="https://www.un.org/unispal/document/advisory-opinion-icj-19jul24/">International Court of Justice, advisory opinion of 19 July 2024: Legal Consequences arising from the Policies and Practices of Israel in the Occupied Palestinian Territory, including East Jerusalem</L></li>
            <li><L href="https://www.un.org/unispal/document/summary-advisory-opinion-icj-22oct25/">International Court of Justice, advisory opinion of 22 October 2025 (summary): Obligations of Israel in relation to the Presence and Activities of the United Nations, Other International Organizations and Third States in and in relation to the Occupied Palestinian Territory</L></li>
            <li><L href="https://www.amnesty.org/en/documents/mde15/8744/2024/en/">Amnesty International, &ldquo;You Feel Like You Are Subhuman&rdquo; (December 2024)</L></li>
            <li><L href="https://www.amnesty.org/en/documents/mde15/5141/2022/en/">Amnesty International, Israel&rsquo;s apartheid against Palestinians (February 2022)</L></li>
            <li><L href="https://www.hrw.org/report/2021/04/27/threshold-crossed/israeli-authorities-and-crimes-apartheid-and-persecution">Human Rights Watch, A Threshold Crossed (April 2021)</L></li>
            <li><L href="https://www.btselem.org/publications/fulltext/202101_this_is_apartheid">B&rsquo;Tselem, This is apartheid (January 2021)</L></li>
          </ul>

          <ReferenceList
            pageId="stand"
            items={[
              { n: 1, text: 'International Criminal Tribunal for Rwanda (1998). Judgement in Prosecutor v. Akayesu (2 September 1998). UN ICTR news.', href: 'https://unictr.irmct.org/en/news/historic-judgement-finds-akayesu-guilty-genocide', linkLabel: 'Source page' },
              { n: 2, text: 'International Court of Justice (2007). Bosnia and Herzegovina v. Serbia and Montenegro: Judgment of 26 February 2007. ICJ, case 91.', href: 'https://www.icj-cij.org/case/91', linkLabel: 'Source page' },
              { n: 3, text: 'Extraordinary Chambers in the Courts of Cambodia (2022). Khieu Samphan: charges, trial and appeal judgments (Case 002). ECCC.', href: 'https://www.eccc.gov.kh/en/cases/charged-profile/khieu-samphan', linkLabel: 'Source page' },
              { n: 4, text: 'Bloxham D (2005). The Great Game of Genocide. Oxford University Press.', href: 'https://doi.org/10.1093/acprof:oso/9780199273560.001.0001', linkLabel: 'Publisher page (may need payment)' },
              { n: 5, text: 'President of the United States (Biden J) (2021). Statement on Armenian Remembrance Day, 24 April 2021. White House archive.', href: 'https://bidenwhitehouse.archives.gov/briefing-room/statements-releases/2021/04/24/statement-by-president-joe-biden-on-armenian-remembrance-day/', linkLabel: 'Source page' },
              { n: 6, text: 'Engerman S, Sokoloff K (2002). Factor Endowments, Inequality, and Paths of Development among New World Economies. Economía.', href: 'https://doi.org/10.1353/eco.2002.0013', linkLabel: 'Free full text' },
              { n: 7, text: 'Wolfe P (2006). Settler colonialism and the elimination of the native. Journal of Genocide Research.', href: 'https://doi.org/10.1080/14623520601056240', linkLabel: 'Free full text' },
              { n: 8, text: 'US Department of the Interior (2024). Federal Indian Boarding School Initiative Investigative Report, Volumes I (May 2022) and II (July 2024). Bureau of Indian Affairs.', href: 'https://www.bia.gov/service/federal-indian-boarding-school-initiative', linkLabel: 'Source page' },
              { n: 9, text: 'President of the United States (Biden J) (2024). Remarks on the Federal Indian Boarding Schools, Gila River Indian Community, 25 October 2024. Daily Compilation of Presidential Documents DCPD-202400946, govinfo.gov.', href: 'https://www.govinfo.gov/content/pkg/DCPD-202400946/html/DCPD-202400946.htm', linkLabel: 'Source page' },
              { n: 10, text: 'Acemoglu D, Johnson S, Robinson J (2001). The Colonial Origins of Comparative Development: An Empirical Investigation. American Economic Review.', href: 'https://doi.org/10.1257/aer.91.5.1369', linkLabel: 'Free full text' },
              { n: 11, text: 'Nunn N (2008). The Long-Term Effects of Africa\'s Slave Trades. Quarterly Journal of Economics.', href: 'https://doi.org/10.1162/qjec.2008.123.1.139', linkLabel: 'Publisher page (may need payment)' },
              { n: 12, text: 'Dell M (2010). The Persistent Effects of Peru\'s Mining Mita. Econometrica.', href: 'https://doi.org/10.3982/ECTA8121', linkLabel: 'Free full text' },
              { n: 13, text: 'UN General Assembly (1960). Declaration on the Granting of Independence to Colonial Countries and Peoples (resolution 1514 (XV), 14 December 1960). OHCHR.', href: 'https://www.ohchr.org/en/instruments-mechanisms/instruments/declaration-granting-independence-colonial-countries-and-peoples', linkLabel: 'Source page' },
              { n: 14, text: 'International Court of Justice (2024). Legal Consequences arising from the Policies and Practices of Israel in the Occupied Palestinian Territory, including East Jerusalem (Advisory Opinion, 19 July 2024). ICJ, case 186.', href: 'https://www.icj-cij.org/case/186', linkLabel: 'Source page' },
              { n: 15, text: 'Milanovic M (2025). The Notion of an Illegal Occupation in the ICJ’s Palestine Advisory Opinion. International and Comparative Law Quarterly.', href: 'https://doi.org/10.1017/s0020589325100833', linkLabel: 'Free full text' },
              { n: 16, text: 'Longobardo M (2025). Legal Consequences Arising from the Policies and Practices of Israel in the Occupied Palestinian Territory, Including East Jerusalem. American Journal of International Law.', href: 'https://doi.org/10.1017/ajil.2025.4', linkLabel: 'Free full text' },
              { n: 17, text: 'International Court of Justice (2025). Obligations of Israel in relation to the Presence and Activities of the United Nations, Other International Organizations and Third States in and in relation to the Occupied Palestinian Territory (Advisory Opinion, 22 October 2025). ICJ, case 196.', href: 'https://www.icj-cij.org/case/196', linkLabel: 'Source page' },
              { n: 18, text: 'Sanger A (2026). RELIEF FOR UNRWA? ISRAEL MUST ENSURE ESSENTIAL HUMANITARIAN AID REACHES PALESTINIAN POPULATION. The Cambridge Law Journal.', href: 'https://doi.org/10.1017/s0008197326101433', linkLabel: 'Free full text' },
              { n: 19, text: 'B\'Tselem (2021). A regime of Jewish supremacy from the Jordan River to the Mediterranean Sea: This is apartheid (position paper, 12 January 2021). B\'Tselem.', href: 'https://www.btselem.org/publications/fulltext/202101_this_is_apartheid', linkLabel: 'Source page' },
              { n: 20, text: 'Human Rights Watch (2021). A Threshold Crossed: Israeli Authorities and the Crimes of Apartheid and Persecution. Human Rights Watch, 27 April 2021.', href: 'https://www.hrw.org/report/2021/04/27/threshold-crossed/israeli-authorities-and-crimes-apartheid-and-persecution', linkLabel: 'Source page' },
              { n: 21, text: 'Amnesty International (2022). Israel\'s Apartheid against Palestinians: Cruel System of Domination and Crime against Humanity (MDE 15/5141/2022). Amnesty International, 1 February 2022.', href: 'https://www.amnesty.org/en/documents/mde15/5141/2022/en/', linkLabel: 'Source page' },
              { n: 22, text: 'Dugard J, Reynolds J (2013). Apartheid, International Law, and the Occupied Palestinian Territory. European Journal of International Law.', href: 'https://doi.org/10.1093/ejil/cht045', linkLabel: 'Free full text' },
              { n: 23, text: 'UN Independent International Commission of Inquiry on the Occupied Palestinian Territory, including East Jerusalem, and Israel (2025). Legal analysis of the conduct of Israel in Gaza pursuant to the Convention on the Prevention and Punishment of the Crime of Genocide (A/HRC/60/CRP.3, 16 September 2025). UN Human Rights Council conference room paper.', href: 'https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/sessions-regular/session60/advance-version/a-hrc-60-crp-3.pdf', linkLabel: 'Source page' },
              { n: 24, text: 'Amnesty International (2024). "You Feel Like You Are Subhuman": Israel\'s Genocide Against Palestinians in Gaza (MDE 15/8744/2024). Amnesty International, 5 December 2024.', href: 'https://www.amnesty.org/en/documents/mde15/8744/2024/en/', linkLabel: 'Source page' },
              { n: 25, text: 'Amnesty International (2025). Israel/OPT: Israeli organizations conclude Israel is committing genocide against Palestinians in Gaza (news release, 28 July 2025). Amnesty International.', href: 'https://www.amnesty.org/en/latest/news/2025/07/israel-opt-israeli-organizations-conclude-israel-committing-genocide-against-palestinians-in-gaza-in-another-milestone-for-accountability-efforts/', linkLabel: 'Source page' },
              { n: 26, text: 'Times of Israel (news report) (2025). UN panel claims genocide underway in Gaza; Israel blasts members as Hamas proxies. Times of Israel, 16 September 2025.', href: 'https://www.timesofisrael.com/un-panel-claims-genocide-underway-in-gaza-israel-blasts-members-as-hamas-proxies/', linkLabel: 'Source page' },
              { n: 27, text: 'International Court of Justice (2024). Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip (South Africa v. Israel): Order of 26 January 2024 (summary). ICJ, case 192.', href: 'https://www.icj-cij.org/node/203454', linkLabel: 'Source page' },
              { n: 28, text: 'International Court of Justice (2026). South Africa v. Israel: case page and list of orders. ICJ, case 192.', href: 'https://www.icj-cij.org/case/192', linkLabel: 'Source page' },
              { n: 29, text: 'Dannenbaum T, Dill J (2024). International Law in Gaza: Belligerent Intent and Provisional Measures. American Journal of International Law.', href: 'https://doi.org/10.1017/ajil.2024.53', linkLabel: 'Free full text' },
              { n: 30, text: 'Sultany N (2024). A Threshold Crossed: On Genocidal Intent and the Duty to Prevent Genocide in Palestine. Journal of Genocide Research.', href: 'https://doi.org/10.1080/14623528.2024.2351261', linkLabel: 'Free full text' },
              { n: 31, text: 'Polzin M (2025). Did the ICJ Act Ultra Vires? The Orders on the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip. Israel Law Review.', href: 'https://doi.org/10.1017/S0021223725100034', linkLabel: 'Free full text' },
              { n: 32, text: 'Moses A (2025). Introduction: Gaza and the Problems of Genocide Studies. Journal of Genocide Research.', href: 'https://doi.org/10.1080/14623528.2025.2558401', linkLabel: 'Free full text' },
              { n: 33, text: 'Jerusalem Declaration on Antisemitism (scholars’ declaration) (2021). Jerusalem Declaration on Antisemitism. jerusalemdeclaration.org.', href: 'https://jerusalemdeclaration.org/', linkLabel: 'Source page' },
              { n: 34, text: 'Haslam N (2006). Dehumanization: An Integrative Review. Personality and Social Psychology Review.', href: 'https://doi.org/10.1207/s15327957pspr1003_4', linkLabel: 'Publisher page (may need payment)' },
              { n: 35, text: 'Haslam N, Loughnan S (2014). Dehumanization and Infrahumanization. Annual Review of Psychology.', href: 'https://doi.org/10.1146/annurev-psych-010213-115045', linkLabel: 'Free full text' },
              { n: 36, text: 'UN General Assembly (1948). Convention on the Prevention and Punishment of the Crime of Genocide. UN Audiovisual Library of International Law.', href: 'https://legal.un.org/avl/ha/cppcg/cppcg.html', linkLabel: 'Source page' },
            ]}
          />
        </Card>
      </div>
      <AppFooter />
    </div>
  );
}
