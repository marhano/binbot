from threading import Thread
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import tkinter as tk
from tkinter import messagebox
import re
from progress.bar import Bar

def handle_login():
    # Open the webpage
    driver.get("http://binpo.paybps.ovpn/intranet/panels/helpdesk_edit_rules.php")
    driver.implicitly_wait(0.5)

    username = driver.find_element(By.ID, "frmuser")
    username.clear()
    username.send_keys(entry_username.get())

    password = driver.find_element(By.ID, "frmpass")
    password.clear()
    password.send_keys(entry_password.get())

    submit = driver.find_element(By.ID, "submit")
    submit.click()
    driver.implicitly_wait(1)                                                               
    
    #driver.get(form_link)
    driver.get("http://binpo.paybps.ovpn/intranet/panels/helpdesk_edit_workflow.php?id=97")
    xpath_expression =  "//td/span[text()='actions4']/ancestor::tr/following-sibling::tr//div[@id='new_link']/a"
    element = driver.find_element(By.XPATH, xpath_expression)
    element.click()

    # REMOVE LOGIN GUI
    label_username.destroy()
    entry_username.destroy()
    label_password.destroy()
    entry_password.destroy()
    button_login.destroy()
    remember_me_checkbox.destroy()

    #create_or_update_rules_gui()

def create_or_update_rules_gui():
    global rules_gui_created

    if not rules_gui_created:
        create_rules_gui()
        rules_gui_created = True
    else:
        update_rules_gui()

def create_rules_gui():
    global entry_num_rules, entry_ref_id, entry_ref_name
    # RULES GUI
    tk.Label(frame_main, text="Number of Rules: ").pack()
    entry_num_rules = tk.Entry(frame_main)
    entry_num_rules.pack()

    tk.Label(frame_main, text="Ref ID: ").pack()
    entry_ref_id = tk.Entry(frame_main)
    entry_ref_id.pack()

    # TRIGGER RULE CREATTION
    button_process_rules = tk.Button(frame_main, text="Process Rules", command=handle_process_rules)
    button_process_rules.pack()

def clear_rules_gui():
    clear_entry_if_not_empty(entry_num_rules)
    clear_entry_if_not_empty(entry_ref_id)

def clear_entry_if_not_empty(entry_widget):
    if has_content(entry_widget):
        entry_widget.delete(0, tk.END)
        
def has_content(entry_widget):
    content = entry_widget.get()
    return bool(content)

def update_rules_gui():
    clear_rules_gui()

def handle_process_rules():
    total_items = len(reference_obj)
    bar = Bar('Processing', max=total_items, fill='█', suffix='%(percent)d%%', check_tty=False, color='green', suffix_colors={'percent': 'green'}, title_width=20)
    for key, value in reference_obj.items():
        try:
            bar.next()
            numeric_part = re.search(r'\d+', entry_ref_id.get()).group()
            non_numeric_part = re.search(r'\D+', entry_ref_id.get()).group()
            ref_name = "Ref#" + numeric_part
            rule_ref_name = ref_name + "__" + key

            if check_if_existing(rule_ref_name):
                print("Threats:", value['threats_that_can_lead_to'])
                print("Supporting Assets:", value["supporting_assets"])
                print("Actions:", value["actions"])

                order_number = driver.find_elements(By.XPATH, f"//a[contains(text(), '{rule_ref_name}')]")
                order_number[0].click()


                print(non_numeric_part, numeric_part)
                if int(numeric_part) == 1:
                    xpath_expression =  f"//input[@value='{non_numeric_part}']"
                elif int(numeric_part) >= 2 & int(numeric_part) <= 6:
                    xpath_expression =  f"//input[@value='{non_numeric_part}{int(numeric_part) - 1}']"
                else:
                    xpath_expression =  f"//input[@value='{entry_ref_id.get()}']"
                
                print(xpath_expression)
                checkbox_ref = driver.find_element(By.XPATH, xpath_expression)
                if checkbox_ref.is_enabled():
                    checkbox_ref.click()

                #threats_that_can_lead_to_0 - threats_that_can_lead_to_2 - threats_that_can_lead_to_3 - threats_that_can_lead_to_4
                #supporting_assets1 - supporting_assets2 - supporting_assets3 - supporting_assets4 - 
                #actions1 - actions2 - actions3 - actions4

                if int(numeric_part) == 2:
                    threats_that_can_lead_to = driver.find_element(By.XPATH, f"//input[contains(@value, 'threats_that_can_lead_to_0')]")
                    supporting_assets = driver.find_element(By.XPATH, f"//input[contains(@value, 'supporting_assets1')]")
                    actions = driver.find_element(By.XPATH, f"//input[contains(@value, 'actions1')]")
                elif int(numeric_part) >= 3 & int(numeric_part) <= 6:
                    threats_that_can_lead_to = driver.find_element(By.XPATH, f"//input[contains(@value, 'threats_that_can_lead_to_{int(numeric_part) - 1}')]")
                    supporting_assets = driver.find_element(By.XPATH, f"//input[contains(@value, 'supporting_assets{int(numeric_part) - 1}')]")
                    actions = driver.find_element(By.XPATH, f"//input[contains(@value, 'actions{int(numeric_part) - 1}')]")
                else:
                    threats_that_can_lead_to = driver.find_element(By.XPATH, f"//input[contains(@value, 'threats_that_can_lead_to_{numeric_part}')]")
                    supporting_assets = driver.find_element(By.XPATH, f"//input[contains(@value, 'supporting_assets_{numeric_part}')]")
                    actions = driver.find_element(By.XPATH, f"//input[contains(@value, 'actions_{numeric_part}')]")
                
                threats_that_can_lead_to.click()
                threats_that_can_lead_to.find_element(By.XPATH, f"ancestor::tr//select[@class='form-control']/option[text()='{value['threats_that_can_lead_to']}']").click()
                
                supporting_assets.click()
                supporting_assets.find_element(By.XPATH, f"ancestor::tr//select[@class='form-control']/option[text()='{value['supporting_assets']}']").click()

                actions.click()
                actions.find_element(By.XPATH, f"ancestor::tr//select[@class='form-control']/option[text()='{value['actions']}']").click()

                trigger = driver.find_element(By.ID, "for_trigger")
                if trigger.is_enabled():
                    trigger.click()

                # SAVE
                driver.find_element(By.NAME, "add_rule").click()


            add_new_condition_set = driver.find_element(By.NAME, "add_rule_link")
            add_new_condition_set.click()

            driver.implicitly_wait(1)

            
            rule_name = driver.find_element(By.ID, "rule_name")
            rule_name.send_keys(rule_ref_name)

            # CHECKBOXES
            driver.find_element(By.ID, "for_fields_rights").click()
            driver.find_element(By.ID, "for_workflow").click()
            driver.find_element(By.ID, "for_sla").click()

            # REFERENCE NUMBER ID
            threats_that_can_lead_to = driver.find_element(By.XPATH, f"//input[contains(@value, 'threats_that_can_lead_to__{numeric_part}')]")
            threats_that_can_lead_to.click()
            threats_that_can_lead_to.find_element(By.XPATH, f"ancestor::tr//select[@class='form-control']/option[text()='{value['threats_that_can_lead_to']}']").click()

            supporting_assets = driver.find_element(By.XPATH, f"//input[contains(@value, 'supporting_assets_{numeric_part}')]")
            supporting_assets.click()
            supporting_assets.find_element(By.XPATH, f"ancestor::tr//select[@class='form-control']/option[text()='{value['supporting_assets']}']").click()

            actions = driver.find_element(By.XPATH, f"//input[contains(@value, 'actions_{numeric_part}')]")
            actions.click()
            actions.find_element(By.XPATH, f"ancestor::tr//select[@class='form-control']/option[text()='{value['actions']}']").click()

            # FOR TRIGGER
            driver.find_element(By.ID, "for_trigger").click()

            # SAVE
            driver.find_element(By.NAME, "add_rule").click()

        except NoSuchElementException as e:
            messagebox.showerror("Error", "Reference ID not found!")
            print(e)
            driver.get(form_link)
            break
    bar.finish()

    choice = messagebox.askyesno("Confirmation", "Do you want to enter more rules?")
    if not choice:
        driver.quit()
    
    clear_rules_gui()

def check_if_existing(rule_ref_name):
    order_number = driver.find_elements(By.XPATH, f"//a[contains(text(), '{rule_ref_name}')]")
    if order_number:
        return True
    else:
        return False    

def handle_remember_me():
    if remember_me_var.get() == 1:
        with open("credentials.txt", "w") as file:
            file.write(f"{entry_username.get()}:{entry_password.get()}")
    else:
        with open("credentials.txt", "w") as file:
            file.write("")

def populate_login_form():
    try:
        with open("credentials.txt", "r") as file:
            saved_credentials = file.readline().strip().split(":")
            if len(saved_credentials) == 2:
                entry_username.insert(0, saved_credentials[0])
                entry_password.insert(0, saved_credentials[1])
                remember_me_var.set(1)
    except FileNotFoundError:
        pass



driver = webdriver.Chrome()
reference_number_arr = ["LCD-A0001A", "LCD-A0001B", "LCD-A0001C", "LCD-A0001D", "LCD-A0002A", "LCD-A0002B", "LCD-A0002C", "LCD-A0003B", "LCD-A0004B", "LCD-A0004E", "LCD-A0004D", "LCD-A0005B", "LCD-A0005D", "LCD-B0001C", "LCD-B0002A", "LCD-B0002C", "LCD-B0003A", "LCD-B0004F", "LCD-B0004E", "LCD-B0005C", "LCD-C0001A", "LCD-C0001F", "LCD-C0001C", "LCD-C0001G", "LCD-C0001D", "LCD-C0002A", "LCD-C0002F", "LCD-C0002C", "LCD-C0002G", "LCD-C0002D", "LCD-C0003F", "LCD-C0004F", "LCD-C0004D", "LCD-C0005A", "LCD-C0005G", "LCD-C0005D", "LCD-C0006F", "LCD-C0006C", "LCD-C0006D"]

reference_obj = {
    "LCD-A0001A": {
        "example_threats": "Use of USB flash drives or disks that are ill-suited to the sensitivity of the information; use or transportation of sensitive hardware for personal purposes, the hard drive containing the information is used for purposes other than the intended purpose (e.g. to transport other data to a service provider, to transfer other data from one database to another, etc.)",
        "supporting_assets": "Hardware",
        "actions": "Used inappropriately",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0001B": {
        "example_threats": "Watching a person's screen without their knowledge; taking a photo of a screen; geolocation of hardware; remote detection of electromagnetic signals",
        "supporting_assets": "Hardware",
        "actions": "Observed",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0001C": {
        "example_threats": "Tracking by a hardware-based keylogger; removal of hardware components; connection of devices (such as USB flash drives) to launch an operating system or retrieve data",
        "supporting_assets": "Hardware",
        "actions": "Altered",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0001D": {
        "example_threats": "Theft of a laptop; theft of a work cell phone; retrieval of a discarded storage device or hardware; loss of an electronic storage device",
        "supporting_assets": "Hardware",
        "actions": "Lost",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0002A": {
        "example_threats": "Content scanning; illegitimate cross-referencing of data; raising of privileges, erasure of tracks; sending of spam via an e-mail program; misuse of network functions",
        "supporting_assets": "Software",
        "actions": "Used inappropriately",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0002B": {
        "example_threats": "Scanning of network addresses and ports; collection of configuration data; analysis of source codes in order to locate exploitable flaws; testing of how databases respond to malicious queries",
        "supporting_assets": "Software",
        "actions": "Observed",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0002C": {
        "example_threats": "Tracking by a software-based key logger; infection by malicious code; installation of a remote administration tool; substitution of components during an update, a maintenance operation or installation (code-bits or applications are installed or replaced)",
        "supporting_assets": "Software",
        "actions": "Altered",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0003B": {
        "example_threats": "Interception of Ethernet traffic; acquisition of data sent over a Wi-Fi network",
        "supporting_assets": "Computer channels",
        "actions": "Observed",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0004B": {
        "example_threats": "Unintentional disclosure of information while talking; use of listening devices to eavesdrop on meetings",
        "supporting_assets": "People",
        "actions": "Observed",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0004E": {
        "example_threats": "Influence (phishing, social engineering, bribery), pressure (blackmail, psychological harassment)",
        "supporting_assets": "People",
        "actions": "Manipulated",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0004D": {
        "example_threats": "Employee poaching; assignment changes; takeover of all or part of the organization",
        "supporting_assets": "People",
        "actions": "Lost",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0005B": {
        "example_threats": "Reading, photocopying, photographing",
        "supporting_assets": "Paper documents",
        "actions": "Observed",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-A0005D": {
        "example_threats": "Theft of files from offices; theft of mail from mailboxes; retrieval of discarded documents",
        "supporting_assets": "Paper documents",
        "actions": "Lost",
        "threats_that_can_lead_to": "an illegitimate access to personal data"
    },
    "LCD-B0001C": {
        "example_threats": "Addition of incompatible hardware resulting in malfunctions; removal of components essential to the proper operation of an application",
        "supporting_assets": "Hardware",
        "actions": "Altered",
        "threats_that_can_lead_to": "an unwanted modification of personal data"
    },
    "LCD-B0002A": {
        "example_threats": "Unwanted modifications to data in databases; erasure of files required for software to run properly; operator errors that modify data",
        "supporting_assets": "Software",
        "actions": "Used inappropriately",
        "threats_that_can_lead_to": "an unwanted modification of personal data"
    },
    "LCD-B0002C": {
        "example_threats": "Errors during updates, configuration or maintenance; infection by malicious code; replacement of components",
        "supporting_assets": "Software",
        "actions": "Altered",
        "threats_that_can_lead_to": "an unwanted modification of personal data"
    },
    "LCD-B0003A": {
        "example_threats": "Man-in-the-middle attack to modify or add data to network traffic; replay attack (resending of intercepted data)",
        "supporting_assets": "Computer channels",
        "actions": "Used inappropriately",
        "threats_that_can_lead_to": "an unwanted modification of personal data"
    },
    "LCD-B0004F": {
        "example_threats": "High workload, stress or negative changes in working conditions; assignment of staff to tasks beyond their abilities; poor use of skills",
        "supporting_assets": "People",
        "actions": "Overloaded",
        "threats_that_can_lead_to": "an unwanted modification of personal data"
    },
    "LCD-B0004E": {
        "example_threats": "Influence (rumor, disinformation)",
        "supporting_assets": "People",
        "actions": "Manipulated",
        "threats_that_can_lead_to": "an unwanted modification of personal data"
    },
    "LCD-B0005C": {
        "example_threats": "Changes to figures in a file; replacement of an original by a forgery",
        "supporting_assets": "Paper documents",
        "actions": "Altered",
        "threats_that_can_lead_to": "an unwanted modification of personal data"
    },
    "LCD-C0001A": {
        "example_threats": "Storage of personal files; personal use",
        "supporting_assets": "Hardware",
        "actions": "Used inappropriately",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0001F": {
        "example_threats": "Storage unit full; power outage; processing capacity overload; overheating; excessive temperatures, denial of service attack",
        "supporting_assets": "Hardware",
        "actions": "Overloaded",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0001C": {
        "example_threats": "Addition of incompatible hardware resulting in malfunctions; removal of components essential to the proper operation of the system",
        "supporting_assets": "Hardware",
        "actions": "Altered",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0001G": {
        "example_threats": "Flooding, fire, vandalism, damage from natural wear and tear, storage device malfunction",
        "supporting_assets": "Hardware",
        "actions": "Damaged",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0001D": {
        "example_threats": "Theft of a laptop, loss of a cell phone; disposal of a supporting asset or hardware, under-capacity drives leading to a multiplication of supporting assets and to the loss of some",
        "supporting_assets": "Hardware",
        "actions": "Lost",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0002A": {
        "example_threats": "Erasure of data; use of counterfeit or copied software; operator errors that delete data",
        "supporting_assets": "Software",
        "actions": "Used inappropriately",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0002F": {
        "example_threats": "Exceeding of database size; injection of data outside the normal range of values, denial of service attack",
        "supporting_assets": "Software",
        "actions": "Overloaded",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0002C": {
        "example_threats": "Errors during updates, configuration or maintenance; infection by malicious code; replacement of components",
        "supporting_assets": "Software",
        "actions": "Altered",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0002G": {
        "example_threats": "Erasure of a running executable or source codes; logic bomb",
        "supporting_assets": "Software",
        "actions": "Damaged",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0002D": {
        "example_threats": "Non-renewal of the license for software used to access data, stoppage of security maintenance updates by the publisher, bankruptcy of the publisher, corruption of storage module containing the license numbers",
        "supporting_assets": "Software",
        "actions": "Lost",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0003F": {
        "example_threats": "Misuse of bandwidth; unauthorized downloading; loss of Internet connection",
        "supporting_assets": "Computer channels",
        "actions": "Overloaded",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0004F": {
        "example_threats": "High workload, stress or negative changes in working conditions; assignment of staff to tasks beyond their abilities; poor use of skills",
        "supporting_assets": "People",
        "actions": "Overloaded",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0004D": {
        "example_threats": "Death, retirement, reassignment; contract termination or dismissal; takeover of all or part of the organization",
        "supporting_assets": "People",
        "actions": "Lost",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0005A": {
        "example_threats": "Gradual erasure over time; voluntary erasure of portions of a document, reuse of paper to take notes not related to the processing, to make a shopping list, use of notebooks for something else",
        "supporting_assets": "Paper documents",
        "actions": "Used inappropriately",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0005G": {
        "example_threats": "Aging of archived documents; burning of files during a fire",
        "supporting_assets": "Paper documents",
        "actions": "Damaged",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0005D": {
        "example_threats": "Theft of documents; loss of files during a move; disposal",
        "supporting_assets": "Paper documents",
        "actions": "Lost",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0006F": {
        "example_threats": "Mail overload; overburdened validation process",
        "supporting_assets": "Paper transmission channels",
        "actions": "Overloaded",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0006C": {
        "example_threats": "Change in how mail is sent; reassignment of offices or premises; reorganization of paper transmission channels; change in working language",
        "supporting_assets": "Paper transmission channels",
        "actions": "Altered",
        "threats_that_can_lead_to": "a disappearance of personal data"
    },
    "LCD-C0006D": {
        "example_threats": "Elimination of a process following a reorganization; loss of a document delivery company, vacancy",
        "supporting_assets": "Paper transmission channels",
        "actions": "Lost",
        "threats_that_can_lead_to": "a disappearance of personal data"
    }
}

#TEST
# form_link = "http://binpo.paybps.ovpn/intranet/panels/helpdesk_edit_rules.php?id=104"
#PROD
form_link = "http://binpo.paybps.ovpn/intranet/panels/helpdesk_edit_rules.php?id=97"

entry_num_rules = None
entry_ref_id = None
entry_ref_name = None

rules_gui_created = False
stop_flag = False


root = tk.Tk()
gui_thread = Thread(target=root.mainloop)
gui_thread.start()
root.title("Au-BinPo")
root.resizable(False, False)

frame_main = tk.Frame(root, padx=48, pady=32)
frame_main.pack()

label_username = tk.Label(frame_main, text="Username: ")
label_username.pack()
entry_username = tk.Entry(frame_main)
entry_username.pack()

label_password = tk.Label(frame_main, text="Password: ")
label_password.pack()
entry_password = tk.Entry(frame_main, show="*")
entry_password.pack()

remember_me_var = tk.IntVar()
remember_me_checkbox = tk.Checkbutton(frame_main, text="Remember Me", variable=remember_me_var, command=handle_remember_me)
remember_me_checkbox.pack()

populate_login_form()

button_login = tk.Button(frame_main, text="Login", command=handle_login)
button_login.pack()

root.mainloop()